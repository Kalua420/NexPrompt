import { prisma } from '../src/index.js';
import { promptEngine } from '../services/promptEngine.js';
import { getProvider } from '../services/ai/aiManager.js';

const activeGenerations = new Map();
const userRateLimits = new Map(); // Track generation counts per user

// Rate limiting: max 10 generations per minute per user
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimits = userRateLimits.get(userId) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimits.resetAt) {
    // Reset window
    userRateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimits.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimits.count++;
  userRateLimits.set(userId, userLimits);
  return true;
}

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.userId; // Set by authenticateSocket middleware
    
    console.log(`Socket connected: ${socket.id} (user: ${userId})`);

    socket.on('generate-stream', async ({ promptId, content, useCase, provider }) => {
      try {
        // Validate inputs
        if (!promptId || !content || !useCase) {
          socket.emit('error', { error: 'Missing required fields' });
          return;
        }

        // Sanitize content length
        if (typeof content !== 'string' || content.length > 50000) {
          socket.emit('error', { error: 'Content too long (max 50000 characters)' });
          return;
        }

        // Check rate limit
        if (!checkRateLimit(userId)) {
          socket.emit('error', { error: 'Rate limit exceeded. Please wait before generating again.' });
          return;
        }

        // Verify prompt ownership
        const prompt = await prisma.prompt.findFirst({
          where: { id: promptId, userId },
        });

        if (!prompt) {
          socket.emit('error', { error: 'Prompt not found or access denied' });
          return;
        }

        // Validate provider
        const validProviders = ['groq', 'openai', 'anthropic', 'opencode', 'gemini'];
        const selectedProvider = provider || 'groq';
        if (!validProviders.includes(selectedProvider)) {
          socket.emit('error', { error: 'Invalid provider' });
          return;
        }

        const controller = new AbortController();
        activeGenerations.set(socket.id, controller);

        const optimized = await promptEngine(useCase, content, selectedProvider);
        const aiProvider = getProvider(selectedProvider);
        let fullText = '';

        await aiProvider.streamComplete(
          optimized,
          (token) => {
            if (!controller.signal.aborted) {
              fullText += token;
              socket.emit('token', { token, fullText });
            }
          },
          async () => {
            if (!controller.signal.aborted) {
              const tokensUsed = Math.ceil(fullText.length / 4);
              const generation = await prisma.generation.create({
                data: { content: fullText, tokensUsed, promptId },
              });
              socket.emit('done', { fullText, generationId: generation.id });
            }
          },
          (err) => {
            if (!controller.signal.aborted) {
              console.error('AI generation error:', err);
              socket.emit('error', { error: err.message || 'Generation failed' });
            }
          },
          controller.signal
        );
      } catch (err) {
        console.error('Socket generate-stream error:', err);
        if (!activeGenerations.get(socket.id)?.signal.aborted) {
          socket.emit('error', { error: err.message || 'An error occurred during generation' });
        }
      } finally {
        activeGenerations.delete(socket.id);
      }
    });

    socket.on('cancel-generation', () => {
      const controller = activeGenerations.get(socket.id);
      if (controller) {
        controller.abort();
        activeGenerations.delete(socket.id);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (user: ${userId})`);
      const controller = activeGenerations.get(socket.id);
      if (controller) {
        controller.abort();
        activeGenerations.delete(socket.id);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });
}
