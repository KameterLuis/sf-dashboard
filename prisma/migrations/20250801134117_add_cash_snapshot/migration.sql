/*
  Warnings:

  - You are about to drop the `Metric` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Network" AS ENUM ('solana', 'ethereum', 'lido', 'sui', 'aptos', 'celestia', 'offchain');

-- CreateEnum
CREATE TYPE "public"."RevenueSource" AS ENUM ('VALIDATOR_COMMISSION', 'BLOCK_REWARDS', 'MEV', 'PRIORITY_FEES', 'RESTAKE_REWARDS', 'DELEGATION_FEES', 'OTHER_OPERATING_INCOME');

-- CreateEnum
CREATE TYPE "public"."CostCategory" AS ENUM ('COGS', 'PERSONNEL', 'OPEX_OTHER');

-- CreateEnum
CREATE TYPE "public"."CashDirection" AS ENUM ('IN', 'OUT');

-- DropTable
DROP TABLE "public"."Metric";

-- CreateTable
CREATE TABLE "public"."Revenue" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL,
    "network" "public"."Network",
    "source" "public"."RevenueSource" NOT NULL,
    "asset" TEXT,
    "amount" DECIMAL(38,18),
    "valueEur" DECIMAL(38,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HoldingSnapshot" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL,
    "network" "public"."Network",
    "asset" TEXT NOT NULL,
    "amount" DECIMAL(38,18) NOT NULL,
    "priceEur" DECIMAL(38,8) NOT NULL,
    "valueEur" DECIMAL(38,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoldingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CashSnapshot" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL,
    "totalEur" DECIMAL(38,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CashMovement" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL,
    "direction" "public"."CashDirection" NOT NULL,
    "amountEur" DECIMAL(38,2) NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cost" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL,
    "category" "public"."CostCategory" NOT NULL,
    "amountEur" DECIMAL(38,2) NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revenue_at_idx" ON "public"."Revenue"("at");

-- CreateIndex
CREATE INDEX "Revenue_network_at_idx" ON "public"."Revenue"("network", "at");

-- CreateIndex
CREATE INDEX "Revenue_source_at_idx" ON "public"."Revenue"("source", "at");

-- CreateIndex
CREATE INDEX "HoldingSnapshot_network_at_idx" ON "public"."HoldingSnapshot"("network", "at");

-- CreateIndex
CREATE INDEX "HoldingSnapshot_at_idx" ON "public"."HoldingSnapshot"("at");

-- CreateIndex
CREATE UNIQUE INDEX "HoldingSnapshot_at_network_asset_key" ON "public"."HoldingSnapshot"("at", "network", "asset");

-- CreateIndex
CREATE INDEX "CashSnapshot_at_idx" ON "public"."CashSnapshot"("at");

-- CreateIndex
CREATE UNIQUE INDEX "CashSnapshot_at_key" ON "public"."CashSnapshot"("at");

-- CreateIndex
CREATE INDEX "CashMovement_at_idx" ON "public"."CashMovement"("at");

-- CreateIndex
CREATE INDEX "CashMovement_direction_at_idx" ON "public"."CashMovement"("direction", "at");

-- CreateIndex
CREATE INDEX "Cost_at_idx" ON "public"."Cost"("at");

-- CreateIndex
CREATE INDEX "Cost_category_at_idx" ON "public"."Cost"("category", "at");
