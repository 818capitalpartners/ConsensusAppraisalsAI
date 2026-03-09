import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const contactsRouter = Router();

/**
 * POST /api/contacts — Newsletter / ESP subscription.
 * Captures email + optional lane interest for ESP tagging.
 */
contactsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, lane, source } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Upsert person
    const person = await prisma.person.upsert({
      where: { email },
      update: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
      },
      create: {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || null,
        type: 'investor',
      },
    });

    // Send to ESP if configured
    const espApiKey = process.env.ESP_API_KEY;
    if (espApiKey) {
      try {
        const tags = ['subscriber'];
        if (lane) tags.push(`interest_${lane}`);
        if (source) tags.push(`source_${source}`);

        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': espApiKey,
          },
          body: JSON.stringify({
            email,
            attributes: {
              FIRSTNAME: firstName || '',
              LASTNAME: lastName || '',
            },
            listIds: [2], // Default subscriber list
            updateEnabled: true,
          }),
        });
        console.log(`[ESP] Contact synced: ${email}`);
      } catch (espErr) {
        console.error('[ESP] Sync failed:', espErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Contact captured',
      personId: person.id,
    });
  } catch (err) {
    console.error('Error capturing contact:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contacts/stats — Quick subscriber stats (internal).
 */
contactsRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const total = await prisma.person.count();
    const investors = await prisma.person.count({ where: { type: 'investor' } });
    const brokers = await prisma.person.count({ where: { type: 'broker' } });

    res.json({ total, investors, brokers });
  } catch (err) {
    console.error('Error getting contact stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
