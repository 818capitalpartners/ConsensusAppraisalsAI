import { Router, Request, Response } from 'express';
import { createDeal, CreateDealInput, triageOnly, TriageOnlyInput } from '../services/dealsService';
import { buildLenderAppraisalPackage, buildBorrowerFacingSummary } from '../services/lender-output/lenderOutputMapper';
import { buildLenderPdfDocument } from '../services/lender-output/lenderPdfLayout';

/**
 * Strip internal fields from triage result before sending to client.
 * Fields prefixed with _internal are for Monday.com/Slack only.
 */
function sanitizeTriageResult(triage: unknown): unknown {
  if (!triage || typeof triage !== 'object') return triage;
  const obj = triage as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!key.startsWith('_internal')) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const dealsRouter = Router();

function sanitizeFileNamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function readSingleValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * POST /api/deals — Full deal creation (web forms, external leads).
 * Requires contact fields.
 */
dealsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const input: CreateDealInput = req.body;

    // Basic validation
    if (!input.firstName || !input.lastName || !input.email || !input.productLane) {
      res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, productLane',
      });
      return;
    }

    const result = await createDeal(input);

    res.status(201).json({
      success: true,
      dealId: result.deal.id,
      personId: result.person.id,
      triageResult: sanitizeTriageResult(result.deal.aiTriageResult),
      dealScore: result.deal.dealScore,
    });
  } catch (err) {
    console.error('Error creating deal:', err);

    if (err instanceof Error && err.message.includes('Invalid product lane')) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/deals/triage — Triage-only mode for internal deal routing.
 * Does NOT create a person or deal record. Returns triage + lender match only.
 */
dealsRouter.post('/triage', async (req: Request, res: Response) => {
  try {
    const input: TriageOnlyInput = req.body;

    if (!input.productLane) {
      res.status(400).json({ error: 'Missing required field: productLane' });
      return;
    }

    const result = await triageOnly(input);

    res.json({
      success: true,
      triageResult: sanitizeTriageResult(result.triageResult),
      dealScore: result.dealScore,
    });
  } catch (err) {
    console.error('Error in triage:', err);

    if (err instanceof Error && err.message.includes('Invalid product lane')) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/deals/:dealId/lender-package?lenderLoanId=...&view=internal|borrower&download=true|false
 * Returns the lender JSON package plus a PDF-ready document tree.
 */
dealsRouter.get('/:dealId/lender-package', async (req: Request, res: Response) => {
  try {
    const dealId = readSingleValue(req.params.dealId);
    const lenderLoanId = readSingleValue(req.query.lenderLoanId);
    const view = readSingleValue(req.query.view) === 'borrower' ? 'borrower' : 'internal';
    const shouldDownload = readSingleValue(req.query.download) === 'true';

    if (!dealId) {
      res.status(400).json({ error: 'Missing required route param: dealId' });
      return;
    }

    if (!lenderLoanId) {
      res.status(400).json({ error: 'Missing required query param: lenderLoanId' });
      return;
    }

    const lenderPackage = await buildLenderAppraisalPackage({
      lenderLoanId,
      dealId,
    });
    const pdfDocument = buildLenderPdfDocument(lenderPackage);

    const payload = view === 'borrower'
      ? {
        success: true,
        view,
        lenderLoanId,
        dealId,
        package: buildBorrowerFacingSummary(lenderPackage),
        pdfDocument,
      }
      : {
        success: true,
        view,
        lenderLoanId,
        dealId,
        package: lenderPackage,
        borrowerSummary: buildBorrowerFacingSummary(lenderPackage),
        pdfDocument,
      };

    if (shouldDownload) {
      const safeDealId = sanitizeFileNamePart(dealId);
      const safeLoanId = sanitizeFileNamePart(lenderLoanId);
      res.setHeader('Content-Disposition', `attachment; filename=\"lender-package-${safeLoanId}-${safeDealId}.json\"`);
    }

    res.json(payload);
  } catch (err) {
    console.error('Error building lender package:', err);

    if (err instanceof Error && err.message.includes('Deal not found')) {
      res.status(404).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/deals/:dealId/borrower-summary?lenderLoanId=...&download=true|false
 * Returns only the borrower-facing summary plus a PDF-ready document tree.
 */
dealsRouter.get('/:dealId/borrower-summary', async (req: Request, res: Response) => {
  try {
    const dealId = readSingleValue(req.params.dealId);
    const lenderLoanId = readSingleValue(req.query.lenderLoanId);
    const shouldDownload = readSingleValue(req.query.download) === 'true';

    if (!dealId) {
      res.status(400).json({ error: 'Missing required route param: dealId' });
      return;
    }

    if (!lenderLoanId) {
      res.status(400).json({ error: 'Missing required query param: lenderLoanId' });
      return;
    }

    const lenderPackage = await buildLenderAppraisalPackage({
      lenderLoanId,
      dealId,
    });
    const borrowerSummary = buildBorrowerFacingSummary(lenderPackage);
    const pdfDocument = buildLenderPdfDocument(lenderPackage);

    if (shouldDownload) {
      const safeDealId = sanitizeFileNamePart(dealId);
      const safeLoanId = sanitizeFileNamePart(lenderLoanId);
      res.setHeader('Content-Disposition', `attachment; filename=\"borrower-summary-${safeLoanId}-${safeDealId}.json\"`);
    }

    res.json({
      success: true,
      view: 'borrower',
      lenderLoanId,
      dealId,
      package: borrowerSummary,
      pdfDocument,
    });
  } catch (err) {
    console.error('Error building borrower summary:', err);

    if (err instanceof Error && err.message.includes('Deal not found')) {
      res.status(404).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
