import { Request, Response, Router } from 'express';

import { handleUnifiedChat } from '../services/chatService';

export const aiRouter = Router();

aiRouter.post('/content-scripts', async (req: Request, res: Response) => {
  try {
    const result = await handleUnifiedChat('content-script', req.body);
    res.json(result);
  } catch (err) {
    console.error('Error generating content script:', err);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

aiRouter.post('/broker-kit', async (req: Request, res: Response) => {
  try {
    const result = await handleUnifiedChat('broker-kit', req.body);
    res.json(result);
  } catch (err) {
    console.error('Error generating broker kit:', err);
    res.status(500).json({ error: 'Failed to generate broker kit' });
  }
});

aiRouter.post('/competitor-monitor', async (req: Request, res: Response) => {
  try {
    const result = await handleUnifiedChat('competitor-monitor', req.body);
    res.json(result);
  } catch (err) {
    console.error('Error generating competitor monitor:', err);
    res.status(500).json({ error: 'Failed to generate competitor monitor' });
  }
});
