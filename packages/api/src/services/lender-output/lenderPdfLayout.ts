import type { LenderAppraisalPackage } from './lenderOutputTypes';

export interface LenderPdfTextBlock {
  type: 'paragraph' | 'bullets';
  heading?: string;
  content: string | string[];
}

export interface LenderPdfTable {
  heading: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
}

export interface LenderPdfSection {
  key: 'cover' | 'summary' | 'property' | 'valuation-details' | 'comps' | 'risks' | 'appendix';
  title: string;
  textBlocks: LenderPdfTextBlock[];
  tables: LenderPdfTable[];
}

export interface LenderPdfDocument {
  title: string;
  generatedAt: string;
  branding: {
    issuer: '818 Capital';
    reportType: 'Lender Appraisal Summary';
  };
  sections: [
    LenderPdfSection,
    LenderPdfSection,
    LenderPdfSection,
    LenderPdfSection,
    LenderPdfSection,
    LenderPdfSection,
    LenderPdfSection,
  ];
}

function formatCurrency(value: number | null): string {
  if (value == null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value == null) {
    return 'N/A';
  }

  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number | null): string {
  if (value == null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildLenderPdfDocument(pkg: LenderAppraisalPackage): LenderPdfDocument {
  const summaryCommentary = pkg.valuation.commentary.length > 0
    ? pkg.valuation.commentary
    : ['Valuation commentary was not available in the model output.'];

  const cover: LenderPdfSection = {
    key: 'cover',
    title: 'Cover',
    textBlocks: [
      {
        type: 'paragraph',
        content: `818 Capital Lender Appraisal Summary`,
      },
      {
        type: 'bullets',
        content: [
          `Lender Loan ID: ${pkg.metadata.lenderLoanId}`,
          `818 Deal ID: ${pkg.metadata['818DealId']}`,
          `Prepared Date: ${pkg.metadata.createdAt}`,
          `Property: ${pkg.subjectProperty.fullAddress ?? 'Address unavailable'}`,
        ],
      },
    ],
    tables: [],
  };

  const summary: LenderPdfSection = {
    key: 'summary',
    title: 'Summary',
    textBlocks: [
      {
        type: 'bullets',
        content: [
          `As-Is Range: ${formatCurrency(pkg.valuation.asIs.low)} to ${formatCurrency(pkg.valuation.asIs.high)}`,
          `Stabilized Range: ${formatCurrency(pkg.valuation.stabilized.low)} to ${formatCurrency(pkg.valuation.stabilized.high)}`,
          `Confidence: ${formatPercent(pkg.valuation.confidence.overall)}`,
          `Risk Level: ${pkg.riskSummary.overallRiskLevel}`,
        ],
      },
      {
        type: 'bullets',
        heading: 'High-Level Commentary',
        content: summaryCommentary,
      },
    ],
    tables: [],
  };

  const property: LenderPdfSection = {
    key: 'property',
    title: 'Property',
    textBlocks: [
      {
        type: 'bullets',
        content: [
          `Address: ${pkg.subjectProperty.fullAddress ?? 'N/A'}`,
          `Property Type: ${pkg.subjectProperty.propertyType ?? 'N/A'}`,
          `Units: ${formatNumber(pkg.subjectProperty.units)}`,
          `Beds / Baths: ${formatNumber(pkg.subjectProperty.bedrooms)} / ${formatNumber(pkg.subjectProperty.bathrooms)}`,
          `Square Feet: ${formatNumber(pkg.subjectProperty.squareFeet)}`,
          `Year Built: ${formatNumber(pkg.subjectProperty.yearBuilt)}`,
          `Condition: ${pkg.subjectProperty.condition ?? 'N/A'}`,
        ],
      },
    ],
    tables: [],
  };

  const valuationDetails: LenderPdfSection = {
    key: 'valuation-details',
    title: 'Valuation Details',
    textBlocks: [
      {
        type: 'bullets',
        content: [
          `Methods Used: ${pkg.valuation.methodsUsed.join(', ') || 'N/A'}`,
          `NOI: ${formatCurrency(pkg.valuation.keyMetrics.noi)}`,
          `Implied Cap Rate: ${formatPercent(pkg.valuation.keyMetrics.impliedCapRate)}`,
          `Price Per Square Foot: ${formatCurrency(pkg.valuation.keyMetrics.pricePerSquareFoot)}`,
          `DSCR: ${formatNumber(pkg.valuation.keyMetrics.debtServiceCoverageRatio)}`,
        ],
      },
    ],
    tables: [
      {
        heading: 'Key Valuation Metrics',
        columns: ['Metric', 'Value'],
        rows: [
          ['As-Is Point Value', formatCurrency(pkg.valuation.asIs.pointValue)],
          ['Stabilized Point Value', formatCurrency(pkg.valuation.stabilized.pointValue)],
          ['As-Is Confidence', formatPercent(pkg.valuation.confidence.asIs)],
          ['Stabilized Confidence', formatPercent(pkg.valuation.confidence.stabilized)],
          ['Occupancy', formatPercent(pkg.valuation.keyMetrics.occupancy)],
        ],
      },
    ],
  };

  const comps: LenderPdfSection = {
    key: 'comps',
    title: 'Comps',
    textBlocks: [],
    tables: [
      {
        heading: 'Rent Comps',
        columns: ['Address', 'Type', 'Units', 'Rent', 'Rent/SF', 'Distance', 'Source'],
        rows: pkg.comps.rent.map((comp) => ([
          comp.address,
          comp.propertyType,
          comp.units,
          formatCurrency(comp.monthlyRent),
          formatCurrency(comp.rentPerSquareFoot),
          formatNumber(comp.distanceMiles),
          comp.source,
        ])),
      },
      {
        heading: 'Sale Comps',
        columns: ['Address', 'Type', 'Units', 'Sale Price', 'Price/SF', 'Distance', 'Source'],
        rows: pkg.comps.sales.map((comp) => ([
          comp.address,
          comp.propertyType,
          comp.units,
          formatCurrency(comp.salePrice),
          formatCurrency(comp.pricePerSquareFoot),
          formatNumber(comp.distanceMiles),
          comp.source,
        ])),
      },
    ],
  };

  const risks: LenderPdfSection = {
    key: 'risks',
    title: 'Risks',
    textBlocks: [
      {
        type: 'bullets',
        heading: 'Risk Flags',
        content: pkg.riskSummary.combinedRiskFlags.length > 0
          ? pkg.riskSummary.combinedRiskFlags.map((flag) => `${flag.label} (${flag.severity}): ${flag.description}`)
          : ['No risk flags were provided by the valuation payload.'],
      },
      {
        type: 'bullets',
        heading: 'Suggested Mitigants',
        content: pkg.riskSummary.suggestedMitigants.length > 0
          ? pkg.riskSummary.suggestedMitigants
          : ['No mitigants were provided.'],
      },
    ],
    tables: [],
  };

  const appendix: LenderPdfSection = {
    key: 'appendix',
    title: 'Appendix',
    textBlocks: [
      {
        type: 'bullets',
        content: [
          `Model Version: ${pkg.metadata.modelVersion}`,
          `Data Version: ${pkg.metadata.dataVersion}`,
          `Model Run ID: ${pkg.audit.modelRunId ?? 'N/A'}`,
          `Input Snapshot: ${pkg.audit.inputSnapshotIdOrHash ?? 'N/A'}`,
        ],
      },
      {
        type: 'bullets',
        heading: 'Credit Committee Notes',
        content: pkg.audit.notesForCreditCommittee.length > 0
          ? pkg.audit.notesForCreditCommittee
          : ['No credit committee notes were attached.'],
      },
    ],
    tables: [],
  };

  return {
    title: `Lender Appraisal Summary - ${pkg.metadata.lenderLoanId}`,
    generatedAt: pkg.metadata.createdAt,
    branding: {
      issuer: '818 Capital',
      reportType: 'Lender Appraisal Summary',
    },
    sections: [cover, summary, property, valuationDetails, comps, risks, appendix],
  };
}
