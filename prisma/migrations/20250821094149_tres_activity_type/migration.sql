/*
  Warnings:

  - You are about to drop the column `network` on the `TresBalance` table. All the data in the column will be lost.
  - You are about to drop the column `ticker` on the `TresBalance` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `TresTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `ticker` on the `TresTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `TresTransaction` table. All the data in the column will be lost.
  - Added the required column `assetSymbol` to the `TresBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project` to the `TresTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategory` to the `TresTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactiontype` to the `TresTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AssetSymbol" AS ENUM ('SOL', 'USDC', 'ETH', 'LDO', 'USDT', 'APT', 'MNDE', 'LINK', 'TIA', 'W', 'STRD');

-- AlterTable
ALTER TABLE "public"."TresBalance" DROP COLUMN "network",
DROP COLUMN "ticker",
ADD COLUMN     "assetSymbol" "public"."AssetSymbol" NOT NULL;

-- AlterTable
ALTER TABLE "public"."TresTransaction" DROP COLUMN "network",
DROP COLUMN "ticker",
DROP COLUMN "type",
ADD COLUMN     "project" TEXT NOT NULL,
ADD COLUMN     "subcategory" TEXT NOT NULL,
ADD COLUMN     "transactiontype" TEXT NOT NULL;
