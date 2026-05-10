/*
  Warnings:

  - You are about to drop the column `referenceRange` on the `LabRequestItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LabRequestItem" DROP COLUMN "referenceRange",
ADD COLUMN     "referenceRangeMax" DECIMAL(65,30),
ADD COLUMN     "referenceRangeMin" DECIMAL(65,30);
