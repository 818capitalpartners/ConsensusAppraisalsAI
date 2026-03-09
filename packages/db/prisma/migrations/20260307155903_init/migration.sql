-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('investor', 'broker');

-- CreateEnum
CREATE TYPE "DealScore" AS ENUM ('green', 'yellow', 'red');

-- CreateTable
CREATE TABLE "persons" (
    "id" UUID NOT NULL,
    "type" "PersonType" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "product_lane" TEXT NOT NULL,
    "lead_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'web',
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "property_address" TEXT,
    "property_city" TEXT,
    "property_state" TEXT,
    "property_zip" TEXT,
    "property_type" TEXT,
    "units" INTEGER,
    "financials" JSONB,
    "ai_triage_result" JSONB,
    "deal_score" "DealScore",
    "monday_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lenders" (
    "id" UUID NOT NULL,
    "monday_item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product_type" TEXT,
    "min_fico" INTEGER,
    "min_dscr" DOUBLE PRECISION,
    "max_ltv" DOUBLE PRECISION,
    "max_ltc" DOUBLE PRECISION,
    "min_loan" DOUBLE PRECISION,
    "max_loan" DOUBLE PRECISION,
    "max_units" INTEGER,
    "geography" JSONB,
    "notes" TEXT,
    "key_contact" TEXT,
    "contact_email" TEXT,
    "rate_range" TEXT,
    "prepay_options" TEXT,
    "uw_fee" DOUBLE PRECISION,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lenders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "persons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lenders_monday_item_id_key" ON "lenders"("monday_item_id");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
