/*
  Warnings:

  - A unique constraint covering the columns `[user_id,onboarding_component_id]` on the table `user_onboarding_steps` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_steps_user_id_onboarding_component_id_key" ON "user_onboarding_steps"("user_id", "onboarding_component_id");
