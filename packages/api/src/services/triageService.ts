import { DealScore } from '@818capital/db';
import { queryMatchingLenders } from './lenderService';
import { generateNarrative, NarrativeOutput } from './aiNarrative';
import { brandLenders, getProgramCount, BrandedProgram } from './programBranding';

/**
 * AI Triage Engine — dispatches to lane-specific triage functions.
 * Each function computes metrics + scores the deal green/yellow/red.
 * Then generates AI narrative (GPT when available, template fallback).
 */
export async function triageDeal(
  lane: string,
  data: Record<string, unknown>
): Promise<{ result: Record<string, unknown>; score: DealScore }> {
  switch (lane) {
    case 'dscr':
      return triageDSCR(data);
    case 'flip':
      return triageFlip(data);
    case 'str':
      return triageSTR(data);
    case 'multifamily':
      return triageMultifamily(data);
    default:
      throw new Error(`Unknown lane: ${lane}`);
  }
}

// ─── DSCR ──────────────────────────────────────────────

interface DSCRInput {
  purchasePrice?: number;
  monthlyRent?: number;
  annualTaxes?: number;
  annualInsurance?: number;
  hoaDues?: number;
  estimatedFico?: number;
  loanAmount?: number;
  propertyType?: string;
  propertyState?: string;
  units?: number;
}

function estimatePITI(loanAmount: number, annualTaxes: number, annualInsurance: number, hoaDues: number): number {
  const rate = 0.085; // 8.5% current DSCR rate assumption
  const monthlyRate = rate / 12;
  const n = 360; // 30-year
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const monthlyTI = (annualTaxes + annualInsurance) / 12;
  return monthlyPI + monthlyTI + (hoaDues || 0);
}

async function triageDSCR(data: Record<string, unknown>): Promise<{ result: Record<string, unknown>; score: DealScore }> {
  const input = data as unknown as DSCRInput;

  const purchasePrice = Number(input.purchasePrice) || 0;
  const monthlyRent = Number(input.monthlyRent) || 0;
  const annualTaxes = Number(input.annualTaxes) || purchasePrice * 0.0125; // Default 1.25%
  const annualInsurance = Number(input.annualInsurance) || purchasePrice * 0.005; // Default 0.5%
  const hoaDues = Number(input.hoaDues) || 0;
  const estimatedFico = Number(input.estimatedFico) || 700;

  // Default 75% LTV
  const loanAmount = Number(input.loanAmount) || purchasePrice * 0.75;
  const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

  const piti = estimatePITI(loanAmount, annualTaxes, annualInsurance, hoaDues);
  const dscr = piti > 0 ? monthlyRent / piti : 0;

  // Score
  let score: DealScore = 'red';
  if (dscr >= 1.25 && estimatedFico >= 680 && ltv <= 80) {
    score = 'green';
  } else if (dscr >= 1.0 && estimatedFico >= 640) {
    score = 'yellow';
  }

  // Find matching lenders
  const lenders = await queryMatchingLenders({
    productType: 'dscr',
    loanAmount,
    ltv,
    dscr,
    fico: estimatedFico,
    state: input.propertyState as string,
    units: Number(input.units) || 1,
  });

  const metrics = {
    purchasePrice,
    loanAmount,
    ltv: Math.round(ltv * 100) / 100,
    monthlyRent,
    estimatedPITI: Math.round(piti),
    dscr: Math.round(dscr * 100) / 100,
    estimatedFico,
  };

  // Brand lenders as 818 Capital programs (client-facing)
  const programCount = getProgramCount(lenders.length);
  const brandedPrograms = brandLenders(lenders.slice(0, programCount), 'dscr');

  // Generate AI narrative
  let narrative: NarrativeOutput | null = null;
  try {
    narrative = await generateNarrative({
      lane: 'dscr',
      score,
      metrics,
      programCount,
      _internalLenderCount: lenders.length,
      _internalLenderNames: lenders.map((l) => l.name),
    });
  } catch (err) {
    console.error('Narrative generation failed:', err);
  }

  return {
    result: {
      lane: 'dscr',
      metrics,
      narrative,
      // Client-facing: branded programs (no real lender names)
      qualifyingPrograms: brandedPrograms,
      programCount,
      // Internal: real lender data (for Monday.com/Slack only — stripped from API response)
      _internalLenders: lenders.map((l) => ({
        name: l.name,
        maxLtv: l.maxLtv,
        minDscr: l.minDscr,
        rateRange: l.rateRange,
      })),
      _internalLenderCount: lenders.length,
    },
    score,
  };
}

// ─── FLIP ──────────────────────────────────────────────

interface FlipInput {
  purchasePrice?: number;
  rehabBudget?: number;
  arv?: number;
  timelineMonths?: number;
  propertyState?: string;
}

async function triageFlip(data: Record<string, unknown>): Promise<{ result: Record<string, unknown>; score: DealScore }> {
  const input = data as unknown as FlipInput;

  const purchasePrice = Number(input.purchasePrice) || 0;
  const rehabBudget = Number(input.rehabBudget) || 0;
  const arv = Number(input.arv) || 0;
  const timelineMonths = Number(input.timelineMonths) || 6;

  const totalCost = purchasePrice + rehabBudget;
  const ltc = arv > 0 ? (totalCost / arv) * 100 : 0;

  // Three profit scenarios
  const scenarios = [
    { label: 'ARV @ 100%', salePrice: arv },
    { label: 'ARV @ 95%', salePrice: arv * 0.95 },
    { label: 'ARV @ 90%', salePrice: arv * 0.90 },
  ].map((s) => {
    const closingCosts = s.salePrice * 0.03; // 3% selling costs
    const holdingCosts = totalCost * 0.01 * timelineMonths; // ~1%/mo carry
    const profit = s.salePrice - totalCost - closingCosts - holdingCosts;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return {
      ...s,
      closingCosts: Math.round(closingCosts),
      holdingCosts: Math.round(holdingCosts),
      profit: Math.round(profit),
      roi: Math.round(roi * 100) / 100,
    };
  });

  // Score based on 95% ARV scenario
  const midScenario = scenarios[1];
  let score: DealScore = 'red';
  if (midScenario.profit > 30000 && ltc < 75) {
    score = 'green';
  } else if (midScenario.profit > 10000 && ltc < 85) {
    score = 'yellow';
  }

  const lenders = await queryMatchingLenders({
    productType: 'flip',
    loanAmount: totalCost * 0.85, // 85% LTC typical for fix/flip
    state: input.propertyState as string,
  });

  const metrics = {
    purchasePrice,
    rehabBudget,
    totalCost,
    arv,
    ltc: Math.round(ltc * 100) / 100,
    timelineMonths,
  };

  // Brand lenders as 818 Capital programs (client-facing)
  const programCount = getProgramCount(lenders.length);
  const brandedPrograms = brandLenders(lenders.slice(0, programCount), 'flip');

  // Generate AI narrative
  let narrative: NarrativeOutput | null = null;
  try {
    narrative = await generateNarrative({
      lane: 'flip',
      score,
      metrics,
      programCount,
      scenarios: scenarios.map((s) => ({ label: s.label, profit: s.profit, roi: s.roi })),
      _internalLenderCount: lenders.length,
      _internalLenderNames: lenders.map((l) => l.name),
    });
  } catch (err) {
    console.error('Narrative generation failed:', err);
  }

  return {
    result: {
      lane: 'flip',
      metrics,
      scenarios,
      narrative,
      qualifyingPrograms: brandedPrograms,
      programCount,
      _internalLenders: lenders.map((l) => ({
        name: l.name,
        rateRange: l.rateRange,
        notes: l.notes,
      })),
      _internalLenderCount: lenders.length,
    },
    score,
  };
}

// ─── STR (Short-Term Rental) ───────────────────────────

interface STRInput {
  purchasePrice?: number;
  monthlyRevenue?: number;
  occupancyRate?: number;
  managementFeePercent?: number;
  propertyState?: string;
  units?: number;
}

async function triageSTR(data: Record<string, unknown>): Promise<{ result: Record<string, unknown>; score: DealScore }> {
  const input = data as unknown as STRInput;

  const purchasePrice = Number(input.purchasePrice) || 0;
  const monthlyRevenue = Number(input.monthlyRevenue) || 0;
  const occupancyRate = Number(input.occupancyRate) || 70;
  const managementFeePercent = Number(input.managementFeePercent) || 25;

  const effectiveMonthlyIncome = monthlyRevenue * (occupancyRate / 100);
  const managementFee = effectiveMonthlyIncome * (managementFeePercent / 100);
  const netMonthlyIncome = effectiveMonthlyIncome - managementFee;

  // DSCR-style calculation for STR
  const loanAmount = purchasePrice * 0.75;
  const annualTaxes = purchasePrice * 0.0125;
  const annualInsurance = purchasePrice * 0.005;
  const piti = estimatePITI(loanAmount, annualTaxes, annualInsurance, 0);
  const strDscr = piti > 0 ? netMonthlyIncome / piti : 0;

  const annualNetIncome = netMonthlyIncome * 12;
  const capRate = purchasePrice > 0 ? (annualNetIncome / purchasePrice) * 100 : 0;

  let score: DealScore = 'red';
  if (strDscr >= 1.25 && capRate >= 6) {
    score = 'green';
  } else if (strDscr >= 1.0 && capRate >= 4) {
    score = 'yellow';
  }

  const lenders = await queryMatchingLenders({
    productType: 'dscr', // STR typically uses DSCR products
    loanAmount,
    dscr: strDscr,
    state: input.propertyState as string,
    units: Number(input.units) || 1,
  });

  const metrics = {
    purchasePrice,
    monthlyRevenue,
    occupancyRate,
    effectiveMonthlyIncome: Math.round(effectiveMonthlyIncome),
    managementFee: Math.round(managementFee),
    netMonthlyIncome: Math.round(netMonthlyIncome),
    estimatedPITI: Math.round(piti),
    strDscr: Math.round(strDscr * 100) / 100,
    capRate: Math.round(capRate * 100) / 100,
  };

  // Brand lenders as 818 Capital programs (client-facing)
  const programCount = getProgramCount(lenders.length);
  const brandedPrograms = brandLenders(lenders.slice(0, programCount), 'str');

  // Generate AI narrative
  let narrative: NarrativeOutput | null = null;
  try {
    narrative = await generateNarrative({
      lane: 'str',
      score,
      metrics,
      programCount,
      _internalLenderCount: lenders.length,
      _internalLenderNames: lenders.map((l) => l.name),
    });
  } catch (err) {
    console.error('Narrative generation failed:', err);
  }

  return {
    result: {
      lane: 'str',
      metrics,
      narrative,
      qualifyingPrograms: brandedPrograms,
      programCount,
      _internalLenders: lenders.map((l) => ({
        name: l.name,
        rateRange: l.rateRange,
        minDscr: l.minDscr,
      })),
      _internalLenderCount: lenders.length,
    },
    score,
  };
}

// ─── MULTIFAMILY ───────────────────────────────────────

interface MultifamilyInput {
  purchasePrice?: number;
  units?: number;
  noi?: number;
  grossRent?: number;
  operatingExpenseRatio?: number;
  capRate?: number;
  estimatedFico?: number;
  downPaymentPercent?: number;
  propertyState?: string;
}

async function triageMultifamily(data: Record<string, unknown>): Promise<{ result: Record<string, unknown>; score: DealScore }> {
  const input = data as unknown as MultifamilyInput;

  const purchasePrice = Number(input.purchasePrice) || 0;
  const units = Number(input.units) || 1;
  const grossRent = Number(input.grossRent) || 0; // monthly total rent
  const expenseRatio = Number(input.operatingExpenseRatio) || 45; // default 45%
  const inputCapRate = Number(input.capRate) || 0;
  const downPaymentPercent = Number(input.downPaymentPercent) || 25; // default 25%

  // If NOI is provided directly, use it; otherwise compute from grossRent
  let noi: number;
  if (input.noi != null && Number(input.noi) > 0) {
    noi = Number(input.noi);
  } else {
    const annualGrossRent = grossRent * 12;
    const operatingExpenses = annualGrossRent * (expenseRatio / 100);
    noi = annualGrossRent - operatingExpenses;
  }

  const calculatedCapRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
  const pricePerUnit = units > 0 ? purchasePrice / units : 0;

  // DSCR for multifamily
  const loanAmount = purchasePrice * (1 - downPaymentPercent / 100);
  const annualDebtService = estimatePITI(loanAmount, purchasePrice * 0.015, purchasePrice * 0.005, 0) * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  let score: DealScore = 'red';
  if (dscr >= 1.25 && calculatedCapRate >= 6 && units >= 5) {
    score = 'green';
  } else if (dscr >= 1.1 && calculatedCapRate >= 4.5) {
    score = 'yellow';
  }

  const lenders = await queryMatchingLenders({
    productType: 'multifamily',
    loanAmount,
    dscr,
    units,
    state: input.propertyState as string,
  });

  const metrics = {
    purchasePrice,
    units,
    grossMonthlyRent: grossRent,
    noi: Math.round(noi),
    capRate: Math.round(calculatedCapRate * 100) / 100,
    pricePerUnit: Math.round(pricePerUnit),
    loanAmount: Math.round(loanAmount),
    dscr: Math.round(dscr * 100) / 100,
  };

  // Brand lenders as 818 Capital programs (client-facing)
  const programCount = getProgramCount(lenders.length);
  const brandedPrograms = brandLenders(lenders.slice(0, programCount), 'multifamily');

  // Generate AI narrative
  let narrative: NarrativeOutput | null = null;
  try {
    narrative = await generateNarrative({
      lane: 'multifamily',
      score,
      metrics,
      programCount,
      _internalLenderCount: lenders.length,
      _internalLenderNames: lenders.map((l) => l.name),
    });
  } catch (err) {
    console.error('Narrative generation failed:', err);
  }

  return {
    result: {
      lane: 'multifamily',
      metrics,
      narrative,
      qualifyingPrograms: brandedPrograms,
      programCount,
      _internalLenders: lenders.map((l) => ({
        name: l.name,
        maxLtv: l.maxLtv,
        rateRange: l.rateRange,
        maxUnits: l.maxUnits,
      })),
      _internalLenderCount: lenders.length,
    },
    score,
  };
}
