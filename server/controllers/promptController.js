import { prisma } from '../src/index.js';
import { promptEngine } from '../services/promptEngine.js';
import { generateQuestions } from '../services/refineService.js';
import { USE_CASES } from '../config/constants.js';

const VALID_PROVIDERS = ['groq', 'openai', 'anthropic', 'opencode', 'gemini'];

function validateProvider(provider) {
  return provider && VALID_PROVIDERS.includes(provider);
}

export async function getPrompts(req, res) {
  const { conversationId, cursor, limit = 50 } = req.query;
  const where = { userId: req.user.userId };
  if (conversationId) where.conversationId = conversationId;
  
  const take = Math.min(parseInt(limit) || 50, 100); // Max 100 per request
  const queryOptions = {
    where,
    orderBy: { createdAt: 'desc' },
    take,
  };
  
  if (cursor) {
    queryOptions.cursor = { id: cursor };
    queryOptions.skip = 1; // Skip the cursor itself
  }
  
  const prompts = await prisma.prompt.findMany(queryOptions);
  
  const nextCursor = prompts.length === take ? prompts[prompts.length - 1].id : null;
  
  res.json({ prompts, nextCursor });
}

export async function getPrompt(req, res) {
  const prompt = await prisma.prompt.findFirst({
    where: { id: req.params.id, userId: req.user.userId },
    include: { generations: { orderBy: { createdAt: 'desc' } } },
  });
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
  res.json(prompt);
}

export async function createPrompt(req, res) {
  const { title, content, useCase, provider, conversationId } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  if (typeof title !== 'string' || title.length > 500) return res.status(400).json({ error: 'Title must be under 500 characters' });
  if (typeof content !== 'string' || content.length > 50000) return res.status(400).json({ error: 'Content must be under 50000 characters' });
  
  // Validate provider if provided
  if (provider && !validateProvider(provider)) {
    return res.status(400).json({ error: 'Invalid provider. Must be one of: ' + VALID_PROVIDERS.join(', ') });
  }
  
  const prompt = await prisma.prompt.create({
    data: { title, content, useCase, provider, userId: req.user.userId, conversationId: conversationId || undefined },
  });
  if (conversationId) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }
  res.status(201).json(prompt);
}

export async function deletePrompt(req, res) {
  const prompt = await prisma.prompt.findFirst({ where: { id: req.params.id, userId: req.user.userId } });
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
  await prisma.prompt.delete({ where: { id: prompt.id } });
  res.json({ success: true });
}

export async function refinePrompt(req, res) {
  const { content, useCase, provider } = req.body;
  if (!content || !useCase) return res.status(400).json({ error: 'Content and use case required' });
  if (content.length > 50000) return res.status(400).json({ error: 'Content too long' });
  
  // Validate provider
  if (provider && !validateProvider(provider)) {
    return res.status(400).json({ error: 'Invalid provider. Must be one of: ' + VALID_PROVIDERS.join(', ') });
  }
  
  try {
    const questions = await generateQuestions(useCase, content, provider);
    res.json({ questions });
  } catch (err) {
    console.error('Refine prompt error:', err);
    res.status(500).json({ error: err.message || 'Failed to refine prompt' });
  }
}

export async function generatePrompt(req, res) {
  const { content, useCase, provider } = req.body;
  if (!content || !useCase) return res.status(400).json({ error: 'Content and use case required' });
  if (content.length > 50000) return res.status(400).json({ error: 'Content too long' });
  
  // Validate provider
  if (provider && !validateProvider(provider)) {
    return res.status(400).json({ error: 'Invalid provider. Must be one of: ' + VALID_PROVIDERS.join(', ') });
  }
  
  try {
    const optimized = await promptEngine(useCase, content, provider);
    res.json({ optimized });
  } catch (err) {
    console.error('Generate prompt error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate prompt' });
  }
}
