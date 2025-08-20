/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `AccountBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `AccountTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `AccountBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `AccountTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AccountBalance" ADD COLUMN     "hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."AccountTransaction" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_hash_key" ON "public"."AccountBalance"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "AccountTransaction_hash_key" ON "public"."AccountTransaction"("hash");
