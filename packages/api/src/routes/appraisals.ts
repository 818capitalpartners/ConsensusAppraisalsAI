import { Router, Request, Response } from 'express';
import { runAppraisal } from '../services/valuationService';
import { ingestComps, ingestSnapshots, getVendor, genericAdapter } from '../services/marketVendors';

export const appraisalsRouter = Router();

/**
 * POST /api/appraisals/run — Run AI appraisal for a deal.
 * Body: { dealId: string, forceRefresh?: boolean }
 */
appraisalsRouter.post('/run', async (req: Request, res: Response) => {
  try {
    const { dealId, forceRefresh } = req.body;

    if (!dealId) {
      res.status(400).json({ success: false, error: 'dealId is required' });
      return;
    }

    const result = await runAppraisal({ dealId, forceRefresh: forceRefresh ?? false });

    if (!result.success) {
      res.status(422).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    console.error('[appraisals] Error running appraisal:', err);
    res.status(500).json({ success: false, error: 'Internal error running appraisal' });
  }
});

/**
 * POST /api/appraisals/ingest/comps — Ingest comparable sales for a county.
 * Body: { countyFips: string, vendor?: string, data: unknown[] }
 */
appraisalsRouter.post('/ingest/comps', async (req: Request, res: Response) => {
  try {
    const { countyFips, vendor, data } = req.body;

    if (!countyFips || !data) {
      res.status(400).json({ success: false, error: 'countyFips and data are required' });
      return;
    }

    const adapter = vendor ? getVendor(vendor) : genericAdapter;
    const result = await ingestComps(countyFips, adapter, data);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[appraisals] Error ingesting comps:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * POST /api/appraisals/ingest/snapshots — Ingest market snapshots for a county.
 * Body: { countyFips: string, vendor?: string, data: unknown[] }
 */
appraisalsRouter.post('/ingest/snapshots', async (req: Request, res: Response) => {
  try {
    const { countyFips, vendor, data } = req.body;

    if (!countyFips || !data) {
      res.status(400).json({ success: false, error: 'countyFips and data are required' });
      return;
    }

    const adapter = vendor ? getVendor(vendor) : genericAdapter;
    const result = await ingestSnapshots(countyFips, adapter, data);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[appraisals] Error ingesting snapshots:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});
