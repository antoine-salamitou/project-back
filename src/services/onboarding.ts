import { prisma } from "../prisma";
import { OnboardingComponent, UserOnboardingSteps } from "@prisma/client";

export const getNextOnboardingStep = async (userId: number) => {
  const [userSteps, components]: [
    UserOnboardingSteps[],
    OnboardingComponent[]
  ] = await Promise.all([
    prisma.userOnboardingSteps.findMany({ where: { userId } }),
    prisma.onboardingComponent.findMany({
      where: { isActive: true },
      orderBy: { stepIndex: "asc" },
    }),
  ]);

  return (
    components.find(
      (component) =>
        !userSteps.some(
          (step) =>
            step.onboardingComponentId === component.onboardingComponentId &&
            step.completed
        )
    )?.stepIndex ?? null
  );
};
