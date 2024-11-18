/*
  Warnings:

  - Changed the type of `name` on the `onboarding_components` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OnboardingComponentName" AS ENUM ('birthDate', 'address', 'aboutMe');

-- AlterTable
ALTER TABLE "onboarding_components" DROP COLUMN "name",
ADD COLUMN     "name" "OnboardingComponentName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_components_name_key" ON "onboarding_components"("name");
