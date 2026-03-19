from pydantic import BaseModel, EmailStr, Field
from typing import Any


# ── Person ─────────────────────────────────────────────────────────────────────

class PersonInput(BaseModel):
    type: str = "investor"
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: EmailStr
    phone: str | None = None
    company: str | None = None


class PersonOut(BaseModel):
    id: str
    type: str
    first_name: str
    last_name: str
    email: str
    phone: str | None
    company: str | None

    class Config:
        from_attributes = True


# ── Deal ───────────────────────────────────────────────────────────────────────

class DealInput(BaseModel):
    product_lane: str = Field(pattern=r"^(dscr|flip|str|multifamily)$")
    lead_type: str = "investor"
    channel: str = "web"
    property_address: str | None = None
    property_city: str | None = None
    property_state: str | None = Field(None, max_length=2)
    property_zip: str | None = Field(None, max_length=10)
    property_type: str | None = None
    units: int | None = None
    financials: dict[str, Any] = {}


class CreateDealRequest(BaseModel):
    person: PersonInput
    deal: DealInput


class DealOut(BaseModel):
    id: str
    person_id: str
    product_lane: str
    lead_type: str
    channel: str
    status: str
    property_address: str | None
    property_city: str | None
    property_state: str | None
    property_zip: str | None
    property_type: str | None
    units: int | None
    financials: dict
    ai_triage_result: dict | None
    ai_appraisal_result: dict | None = None
    deal_score: str | None
    monday_item_id: str | None

    class Config:
        from_attributes = True


# ── Contact ────────────────────────────────────────────────────────────────────

class ContactSubscribe(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    company: str | None = None
    type: str = "investor"
    tags: list[str] = []


# ── Broker Kit ─────────────────────────────────────────────────────────────────

class BrokerKitRequest(BaseModel):
    broker_name: str = Field(min_length=1)
    broker_company: str | None = None
    target_audience: str | None = None
    product_lanes: list[str] = ["dscr"]


# ── Content ────────────────────────────────────────────────────────────────────

class ContentRequest(BaseModel):
    type: str = Field(pattern=r"^(blog|social|email|scripts)$")
    topic: str = Field(min_length=1)
    lane: str | None = None
    count: int = Field(default=5, ge=1, le=20)


# ── Appraisal AI ──────────────────────────────────────────────────────────────

class AppraisalComp(BaseModel):
    label: str = ""
    address: str | None = None
    distance_miles: float | None = None
    closed_date: str | None = None
    property_type: str | None = None
    beds: int | None = None
    baths: int | None = None
    units: int | None = None
    sqft: int | None = None
    lot_sqft: int | None = None
    price: float | None = None
    price_per_sqft: float | None = None
    monthly_rent: float | None = None
    cap_rate: float | None = None
    source: str | None = None
    notes: str | None = None


class SubjectPropertySnapshot(BaseModel):
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip: str | None = None
    county: str | None = None
    property_type: str | None = None
    lane: str | None = None
    occupancy_status: str | None = None
    units: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    year_built: int | None = None
    square_feet: float | None = None
    lot_square_feet: float | None = None
    current_condition: str | None = None
    stabilized_condition: str | None = None


class DealTermsSnapshot(BaseModel):
    requested_loan_amount: float | None = None
    purchase_price: float | None = None
    contract_price: float | None = None
    borrower_estimated_value: float | None = None
    broker_opinion_value: float | None = None
    prior_appraised_value: float | None = None
    estimated_as_is_value: float | None = None
    estimated_stabilized_value: float | None = None
    arv: float | None = None
    rehab_budget: float | None = None
    closing_costs: float | None = None
    existing_debt_payoff: float | None = None
    land_value: float | None = None
    target_ltv: float | None = None
    target_ltc: float | None = None
    exit_strategy: str | None = None
    hold_period_months: int | None = None


class IncomeAndExpensesSnapshot(BaseModel):
    gross_monthly_rent: float | None = None
    gross_annual_rent: float | None = None
    other_monthly_income: float | None = None
    other_annual_income: float | None = None
    vacancy_rate_pct: float | None = None
    operating_expenses_monthly: float | None = None
    operating_expenses_annual: float | None = None
    taxes_annual: float | None = None
    insurance_annual: float | None = None
    repairs_annual: float | None = None
    utilities_annual: float | None = None
    management_annual: float | None = None
    hoa_annual: float | None = None
    annual_debt_service: float | None = None
    noi_annual: float | None = None


class CapRateRange(BaseModel):
    low: float | None = None
    mid: float | None = None
    high: float | None = None


class MarketDataSnapshot(BaseModel):
    market_name: str | None = None
    county: str | None = None
    state: str | None = None
    median_sale_price: float | None = None
    median_price_per_sqft: float | None = None
    median_rent: float | None = None
    median_rent_per_unit: float | None = None
    vacancy_rate_pct: float | None = None
    cap_rate_range: CapRateRange | None = None
    sale_comps: list[AppraisalComp] = []
    rent_comps: list[AppraisalComp] = []
    market_trends: list[str] = []
    data_issues: list[str] = []


class PriorAnalysisSnapshot(BaseModel):
    triage_score: str | None = None
    triage_narrative: str | None = None
    previous_value_opinion: float | None = None
    analyst_notes: str | None = None
    source_timestamp: str | None = None
    data_quality_issues: list[str] = []


class AiAppraisalInput(BaseModel):
    deal_id: str
    lane: str
    subject_property: SubjectPropertySnapshot = SubjectPropertySnapshot()
    deal_terms: DealTermsSnapshot = DealTermsSnapshot()
    income_and_expenses: IncomeAndExpensesSnapshot = IncomeAndExpensesSnapshot()
    market_data: MarketDataSnapshot = MarketDataSnapshot()
    prior_analysis: PriorAnalysisSnapshot | None = None


class AppraisalValueBlock(BaseModel):
    value_low: float
    value_mid: float
    value_high: float
    confidence_score: float
    primary_methods: list[str]


class AppraisalMetrics(BaseModel):
    noi_annual: float = 0
    cap_rate_implied_at_value_mid: float | None = None
    price_per_sqft_implied_at_value_mid: float | None = None


class AiAppraisalResult(BaseModel):
    as_is: AppraisalValueBlock
    stabilized: AppraisalValueBlock | None = None
    metrics: AppraisalMetrics
    comps_used: list[str] = []
    risk_flags: list[str] = []
    notes_for_credit_committee: str = ""
    notes_for_borrower: str = ""


class BorrowerFacingSummary(BaseModel):
    deal_id: str
    as_is_value_range: str
    stabilized_value_range: str | None = None
    confidence: float
    methods_used: list[str] = []
    risk_summary: list[str] = []
    notes: str = ""
