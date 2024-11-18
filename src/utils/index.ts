import { prisma } from "../prisma";
import { MY_ONBOARDING_STEP_COUNT } from "../constants";

export const getOnboardingStepCount = async () => {
  const stepCount = await prisma.config.findUnique({
    where: {
      name: "onboarding_step_count",
    },
  });
  return parseInt(stepCount?.value || MY_ONBOARDING_STEP_COUNT.toString());
};
