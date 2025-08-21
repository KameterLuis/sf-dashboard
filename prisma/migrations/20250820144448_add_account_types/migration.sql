/*
  Warnings:

  - Added the required column `accountType` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountType` to the `AccountTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('REGULAR', 'FOREIGN');

-- AlterTable
ALTER TABLE "public"."AccountBalance" ADD COLUMN     "accountType" "public"."AccountType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."AccountTransaction" ADD COLUMN     "accountType" "public"."AccountType" NOT NULL;
