import { Router, Request, Response } from 'express';
import { runAppraisal, runQuickAppraisal } from '../services/valuationService';
import { ingestComps, ingestSnapshots, getVendor, genericAdapter } from '../services/marketVendors';
import { estimateRehab } from '../services/rehabEstimator';
import type { PropertyDetails, RehabConditionGrade } from '../services/valuationTypes';

export const appraisalsRouter = Router();

const VALID_GRADES: RehabConditionGrade[] = ['turnkey', 'cosmetic', 'moderate', 'heavy', 'gut'];

/**
 * POST /api/appraisals/quick — Address-first underwrite. No Deal record required.
 * Body: { address, state, zip?, city?, propertyType?, squareFeet?, yearBuilt?,
 *         units?, bedrooms?, bathrooms?, condition?, targetUse? }
 */
appraisalsRouter.post('/quick', async (req: Request, res: Response) => {
  try {
    const result = await runQuickAppraisal(req.body ?? {});
    if (!result.success) {
      res.status(422).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    console.error('[appraisals] Error running quick appraisal:', err);
    res.status(500).json({ success: false, error: 'Internal error running quick appraisal' });
  }
});

/**
 * POST /api/appraisals/rehab — Rehab estimate only.
 * Body: { property: PropertyDetails-shaped object, conditionGrade: RehabConditionGrade }
 */
appraisalsRouter.post('/rehab', async (req: Request, res: Response) => {
  try {
    const { property, conditionGrade } = req.body ?? {};
    if (!property || !conditionGrade) {
      res.status(400).json({ success: false, error: 'property and conditionGrade are required' });
      return;
    }
    if (!VALID_GRADES.includes(conditionGrade)) {
      res.status(400).json({ success: false, error: `conditionGrade must be one of: ${VALID_GRADES.join(', ')}` });
      return;
    }
    const estimate = estimateRehab({ property: property as PropertyDetails, conditionGrade });
    res.json({ success: true, estimate });
  } catch (err) {
    console.error('[appraisals] Error estimating rehab:', err);
    res.status(500).json({ success: false, error: 'Internal error estimating rehab' });
  }
});

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
