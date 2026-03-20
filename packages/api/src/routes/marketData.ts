import { Router } from 'express';
import { z } from 'zod';

import { getMarketContext } from '../services/marketDataService';

export const marketDataRouter = Router();

const requestSchema = z.object({
  state: z.string().length(2).transform((value) => value.toUpperCase()),
  zip: z.string().min(5).max(10).optional(),
  propertyType: z.string().optional(),
});

marketDataRouter.post('/context', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'invalid_market_context_request',
      details: parsed.error.flatten(),
    });
  }

  const result = await getMarketContext(parsed.data);
  return res.json(result);
});
