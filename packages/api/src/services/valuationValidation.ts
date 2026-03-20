import { z } from 'zod';

/**
 * Zod validation schemas for appraisal request inputs, per lane.
 * Used by valuationService before running valuation logic.
 */

// ─── Shared ──────────────────────────────────────────────

const stateSchema = z.string().length(2).toUpperCase().optional();

// ─── DSCR ────────────────────────────────────────────────

export const dscrInputSchema = z.object({
  purchasePrice: z.number().positive('Purchase price must be positive'),
  monthlyRent: z.number().nonnegative('Monthly rent cannot be negative'),
  annualTaxes: z.number().nonnegative().optional(),
  annualInsurance: z.number().nonnegative().optional(),
  hoaDues: z.number().nonnegative().optional(),
  estimatedFico: z.number().int().min(300).max(850).optional(),
  loanAmount: z.number().positive().optional(),
  propertyType: z.string().optional(),
  propertyState: stateSchema,
  units: z.number().int().positive().optional(),
});

export type DSCRInput = z.infer<typeof dscrInputSchema>;

// ─── Flip ────────────────────────────────────────────────

export const flipInputSchema = z.object({
  purchasePrice: z.number().positive('Purchase price must be positive'),
  rehabBudget: z.number().nonnegative('Rehab budget cannot be negative'),
  arv: z.number().positive('ARV must be positive'),
  timelineMonths: z.number().int().positive().max(36).optional(),
  propertyState: stateSchema,
  propertyType: z.string().optional(),
});

export type FlipInput = z.infer<typeof flipInputSchema>;

// ─── STR ─────────────────────────────────────────────────

export const strInputSchema = z.object({
  purchasePrice: z.number().positive('Purchase price must be positive'),
  monthlyRevenue: z.number().nonnegative('Monthly revenue cannot be negative'),
  occupancyRate: z.number().min(0).max(100).optional(),
  managementFeePercent: z.number().min(0).max(100).optional(),
  propertyState: stateSchema,
  propertyType: z.string().optional(),
  units: z.number().int().positive().optional(),
});

export type STRInput = z.infer<typeof strInputSchema>;

// ─── Multifamily ─────────────────────────────────────────

export const multifamilyInputSchema = z.object({
  purchasePrice: z.number().positive('Purchase price must be positive'),
  units: z.number().int().positive('Units must be at least 1'),
  noi: z.number().nonnegative().optional(),
  grossRent: z.number().nonnegative().optional(),
  operatingExpenseRatio: z.number().min(0).max(100).optional(),
  capRate: z.number().min(0).max(100).optional(),
  estimatedFico: z.number().int().min(300).max(850).optional(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  propertyState: stateSchema,
  propertyType: z.string().optional(),
});

export type MultifamilyInput = z.infer<typeof multifamilyInputSchema>;

// ─── Appraisal Request ──────────────────────────────────

export const appraisalRequestSchema = z.object({
  dealId: z.string().uuid('Deal ID must be a valid UUID'),
  forceRefresh: z.boolean().optional().default(false),
});

export type AppraisalRequestInput = z.infer<typeof appraisalRequestSchema>;

// ─── Dispatcher ──────────────────────────────────────────

const LANE_SCHEMAS: Record<string, z.ZodSchema> = {
  dscr: dscrInputSchema,
  flip: flipInputSchema,
  str: strInputSchema,
  multifamily: multifamilyInputSchema,
};

export function validateLaneInput(lane: string, data: unknown): { success: boolean; data?: unknown; errors?: string[] } {
  const schema = LANE_SCHEMAS[lane];
  if (!schema) {
    return { success: false, errors: [`Unknown lane: ${lane}`] };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  };
}
