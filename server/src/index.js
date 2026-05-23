import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import authRoutes from '../routes/auth.js';
import promptRoutes from '../routes/prompts.js';
import templateRoutes from '../routes/templates.js';
import favoriteRoutes from '../routes/favorites.js';
import paymentRoutes from '../routes/payments.js';
import conversationRoutes from '../routes/conversations.js';
import { setupSocketHandlers } from '../sockets/handlers.js';
import { authenticateSocket } from '../middleware/auth.js';

// Validate required environment variables on startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Warn about weak JWT secrets
if (process.env.JWT_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT secrets should be at least 32 characters long for security');
}

export const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);

// Parse allowed origins (support multiple domains for staging/production)
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

const io = new Server(httpServer, {
  cors: { 
    origin: allowedOrigins,
    credentials: true 
  },
});

// Apply Socket.IO authentication middleware
io.use(authenticateSocket);

app.use(helmet());
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json({ limit: '1mb' })); // Add body size limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/conversations', conversationRoutes);

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
