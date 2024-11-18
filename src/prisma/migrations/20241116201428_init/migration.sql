-- CreateTable
CREATE TABLE "user_onboarding_steps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "onboarding_component_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "user_onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_onboarding_steps" ADD CONSTRAINT "user_onboarding_steps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_onboarding_steps" ADD CONSTRAINT "user_onboarding_steps_onboarding_component_id_fkey" FOREIGN KEY ("onboarding_component_id") REFERENCES "onboarding_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
