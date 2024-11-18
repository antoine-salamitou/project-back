-- DropForeignKey
ALTER TABLE "user_onboarding_steps" DROP CONSTRAINT "user_onboarding_steps_user_id_fkey";

-- AddForeignKey
ALTER TABLE "user_onboarding_steps" ADD CONSTRAINT "user_onboarding_steps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
