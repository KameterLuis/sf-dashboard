/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Article";

-- CreateTable
CREATE TABLE "public"."Metric" (
    "id" SERIAL NOT NULL,
    "network" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);
