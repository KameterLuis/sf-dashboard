/*
  Warnings:

  - You are about to drop the column `fiatType` on the `DatevTransaction` table. All the data in the column will be lost.
  - Changed the type of `type` on the `DatevTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."DatevTransaction" DROP COLUMN "fiatType",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."DatevTransactionType";
