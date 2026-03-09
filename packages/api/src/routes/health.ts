import { Router } from 'express';
import { prisma } from '@818capital/db';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
