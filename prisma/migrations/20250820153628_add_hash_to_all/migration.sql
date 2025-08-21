/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `DatevTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `FwBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `FwTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `TresBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `TresTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `DatevTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `FwBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `FwTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `TresBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `TresTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DatevTransaction" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FwBalance" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."FwTransaction" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TresBalance" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TresTransaction" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DatevTransaction_hash_key" ON "public"."DatevTransaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "FwBalance_hash_key" ON "public"."FwBalance"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "FwTransaction_hash_key" ON "public"."FwTransaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "TresBalance_hash_key" ON "public"."TresBalance"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "TresTransaction_hash_key" ON "public"."TresTransaction"("hash");
