import { CollateralPropertyType } from '@818capital/db';
import { Router } from 'express';
import { z } from 'zod';

import { getMarketContextForProperty } from '../services/marketDataService';

export const marketDataRouter = Router();

const requestSchema = z.object({
  state: z.string().length(2).transform((value) => value.toUpperCase()),
  countyFips: z.string().length(5).optional(),
  zip: z.string().min(5).max(10).optional(),
  coords: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  propertyType: z.nativeEnum(CollateralPropertyType),
});

marketDataRouter.post('/context', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'invalid_market_context_request',
      details: parsed.error.flatten(),
    });
  }

  const result = await getMarketContextForProperty(parsed.data);
  return res.json(result);
});
