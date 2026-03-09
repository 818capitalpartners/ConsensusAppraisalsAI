import { prisma, PersonType, Prisma } from '@818capital/db';
import { triageDeal } from './triageService';
import { postToMonday } from '../integrations/monday';
import { notifySlack } from '../integrations/slack';
import { sendConfirmationEmail } from '../integrations/email';

export interface CreateDealInput {
  // Person
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  leadType?: string; // investor | broker

  // Deal
  productLane: string; // dscr | flip | str | multifamily

  // Property
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  units?: number;

  // Lane-specific financials (JSONB)
  financials?: Record<string, unknown>;

  // UTM tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  channel?: string;
}

export interface TriageOnlyInput {
  productLane: string;
  property?: {
    state?: string;
    city?: string;
    type?: string;
    units?: number;
  };
  financials?: Record<string, unknown>;
}

const VALID_LANES = ['dscr', 'flip', 'str', 'multifamily'];

function toJsonInput(value?: Record<string, unknown>): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value == null) {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

export async function createDeal(input: CreateDealInput) {
  const lane = input.productLane.toLowerCase();
  if (!VALID_LANES.includes(lane)) {
    throw new Error(`Invalid product lane: ${lane}. Must be one of: ${VALID_LANES.join(', ')}`);
  }

  // 1. Upsert person
  const person = await prisma.person.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || undefined,
      company: input.company || undefined,
    },
    create: {
      type: (input.leadType as PersonType) || 'investor',
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      company: input.company || null,
    },
  });

  // 2. Create deal
  const deal = await prisma.deal.create({
    data: {
      personId: person.id,
      productLane: lane,
      leadType: input.leadType || 'investor',
      channel: input.channel || 'web',
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      propertyAddress: input.propertyAddress || null,
      propertyCity: input.propertyCity || null,
      propertyState: input.propertyState || null,
      propertyZip: input.propertyZip || null,
      propertyType: input.propertyType || null,
      units: input.units || null,
      financials: toJsonInput(input.financials),
    },
  });

  // 3. AI Triage (async — don't block response)
  let triageResult = null;
  let dealScore = null;
  try {
    const triage = await triageDeal(lane, {
      ...input.financials,
      propertyType: input.propertyType,
      propertyState: input.propertyState,
      ...(input.units != null ? { units: input.units } : {}),
    } as Record<string, unknown>);

    triageResult = triage.result;
    dealScore = triage.score;

    // Update deal with triage
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        aiTriageResult: triageResult as object,
        dealScore: dealScore,
      },
    });
  } catch (err) {
    console.error('Triage failed (non-blocking):', err);
  }

  // 4. Side effects (fire-and-forget)
  const sideEffects = async () => {
    try {
      await postToMonday(person, { ...deal, aiTriageResult: triageResult, dealScore }, lane);
    } catch (e) {
      console.error('Monday.com post failed:', e);
    }

    try {
      await notifySlack(person, { ...deal, aiTriageResult: triageResult, dealScore }, lane);
    } catch (e) {
      console.error('Slack notification failed:', e);
    }

    try {
      const triageData = triageResult as Record<string, unknown> | null;
      const triageNarrative = triageData ? {
        lane,
        score: dealScore || 'pending',
        metrics: triageData.metrics as Record<string, number>,
        narrative: triageData.narrative as { headline?: string; analysis?: string; strengths?: string[]; nextSteps?: string[] } | null,
        programCount: triageData.programCount as number || 0,
      } : null;
      await sendConfirmationEmail(person, lane, triageNarrative);
    } catch (e) {
      console.error('Email send failed:', e);
    }
  };

  sideEffects(); // fire-and-forget

  // 5. Return the deal with updated triage
  const updatedDeal = await prisma.deal.findUniqueOrThrow({
    where: { id: deal.id },
  });

  return { person, deal: updatedDeal };
}

/**
 * Triage-only mode — for internal deal routing.
 * Runs triage + lender match WITHOUT creating person/deal records.
 */
export async function triageOnly(input: TriageOnlyInput) {
  const lane = input.productLane.toLowerCase();
  if (!VALID_LANES.includes(lane)) {
    throw new Error(`Invalid product lane: ${lane}. Must be one of: ${VALID_LANES.join(', ')}`);
  }

  // Run triage (includes lender matching + program branding internally)
  const triage = await triageDeal(lane, {
    ...input.financials,
    propertyType: input.property?.type,
    propertyState: input.property?.state,
    ...(input.property?.units != null ? { units: input.property.units } : {}),
  } as Record<string, unknown>);

  return {
    triageResult: triage.result,
    dealScore: triage.score,
  };
}
