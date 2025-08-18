-- CreateEnum
CREATE TYPE "public"."FiatType" AS ENUM ('DOLLAR', 'EURO');

-- CreateEnum
CREATE TYPE "public"."Network" AS ENUM ('solana', 'ethereum', 'chainlink', 'celestia', 'lido', 'aptos', 'sui');

-- CreateEnum
CREATE TYPE "public"."Ticker" AS ENUM ('SOL', 'ETH', 'LINK', 'TIA', 'APT', 'LIDO', 'SUI');

-- CreateEnum
CREATE TYPE "public"."DatevTransactionType" AS ENUM ('REVENUE', 'COGS', 'OTHER_OPERATING_INCOME', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TresTransactionType" AS ENUM ('FEES', 'OPERATIONS', 'OTHER');

-- CreateTable
CREATE TABLE "public"."DatevTransaction" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "public"."DatevTransactionType" NOT NULL,
    "fiatType" "public"."FiatType" NOT NULL,

    CONSTRAINT "DatevTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FwBalance" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fiatType" "public"."FiatType" NOT NULL,

    CONSTRAINT "FwBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FwTransaction" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fiatType" "public"."FiatType" NOT NULL,

    CONSTRAINT "FwTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccountBalance" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fiatType" "public"."FiatType" NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccountTransaction" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "fiatType" "public"."FiatType" NOT NULL,

    CONSTRAINT "AccountTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TresTransaction" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tokenAmount" DECIMAL(65,30) NOT NULL,
    "fiatAmount" DECIMAL(65,30) NOT NULL,
    "network" "public"."Network" NOT NULL,
    "ticker" "public"."Ticker" NOT NULL,
    "type" "public"."TresTransactionType" NOT NULL,

    CONSTRAINT "TresTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TresBalance" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tokenBalance" DECIMAL(65,30) NOT NULL,
    "fiatBalance" DECIMAL(65,30) NOT NULL,
    "ticker" "public"."Ticker" NOT NULL,
    "network" "public"."Network" NOT NULL,

    CONSTRAINT "TresBalance_pkey" PRIMARY KEY ("id")
);
