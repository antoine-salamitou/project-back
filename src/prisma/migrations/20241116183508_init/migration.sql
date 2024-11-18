/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `onboarding_components` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "onboarding_components_name_key" ON "onboarding_components"("name");
