/*
  Warnings:

  - You are about to drop the column `page_number` on the `onboarding_components` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "onboarding_components" DROP COLUMN "page_number",
ADD COLUMN     "step_index" INTEGER NOT NULL DEFAULT 2;
