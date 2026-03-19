import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class Person(Base):
    __tablename__ = "persons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_id)
    type: Mapped[str] = mapped_column(String(10), default="investor")  # investor | broker
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    esp_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    deals: Mapped[list["Deal"]] = relationship(back_populates="person")


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_id)
    person_id: Mapped[str] = mapped_column(String(36), ForeignKey("persons.id"), nullable=False)

    # Classification
    product_lane: Mapped[str] = mapped_column(String(20), nullable=False)  # dscr|flip|str|multifamily
    lead_type: Mapped[str] = mapped_column(String(10), default="investor")
    channel: Mapped[str] = mapped_column(String(50), default="web")
    status: Mapped[str] = mapped_column(String(50), default="new")

    # Property
    property_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    property_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    property_state: Mapped[str | None] = mapped_column(String(2), nullable=True)
    property_zip: Mapped[str | None] = mapped_column(String(10), nullable=True)
    property_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    units: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Financials (flexible JSON)
    financials: Mapped[dict] = mapped_column(JSONB, default=dict)

    # AI triage
    ai_triage_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    deal_score: Mapped[str | None] = mapped_column(String(10), nullable=True)  # green|yellow|red

    # AI appraisal
    ai_appraisal_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # External sync
    monday_item_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    salesforce_opp_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    person: Mapped["Person"] = relationship(back_populates="deals")

    __table_args__ = (
        Index("ix_deals_product_lane", "product_lane"),
        Index("ix_deals_status", "status"),
        Index("ix_deals_person_id", "person_id"),
    )


class Lender(Base):
    __tablename__ = "lenders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_id)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    product_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    min_fico: Mapped[int | None] = mapped_column(Integer, nullable=True)
    min_dscr: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_ltv: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_ltc: Mapped[float | None] = mapped_column(Float, nullable=True)
    min_loan: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_loan: Mapped[float | None] = mapped_column(Float, nullable=True)
    geography: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
