import { Router } from 'express';
import { z } from 'zod';

import { handleUnifiedChat } from '../services/chatService';

export const chatRouter = Router();

const chatRequestSchema = z.object({
  mode: z.enum(['content-script', 'broker-kit', 'competitor-monitor', 'market-context']),
  payload: z.record(z.string(), z.unknown()),
});

chatRouter.post('/', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'invalid_chat_request',
      details: parsed.error.flatten(),
    });
  }

  try {
    const result = await handleUnifiedChat(parsed.data.mode, parsed.data.payload);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'chat_request_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
