import { Request, Response } from "express";
import { prisma } from "../prisma";
import { AuthenticatedRequest } from "../middlewares/authenticate-user";
import { getNextOnboardingStep } from "../services/onboarding";
import { OnboardingComponentName } from "@prisma/client";
import { getOnboardingStepCount } from "../utils";

export const getOnboardingInfo = async (req: Request, res: Response) => {
  try {
    const stepCount = await getOnboardingStepCount();
    res.json({
      totalStepCount: stepCount + 1,
    });
  } catch (error) {
    console.error("Error fetching onboarding info:", error);
    res.status(500).json({ error: "Failed to fetch onboarding info" });
  }
};

export const getOnboardingPage = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }

    const nextOnboardingStep = await getNextOnboardingStep(user.userId);
    if (!nextOnboardingStep) {
      throw new Error("No more onboarding steps");
    }

    const stepCount = await getOnboardingStepCount();

    const onboardingComponents = await prisma.onboardingComponent.findMany({
      where: { stepIndex: nextOnboardingStep, isActive: true },
      select: {
        name: true,
      },
    });

    res.json({
      onboardingComponents,
      user: req.user,
      currentStep: nextOnboardingStep + 1,
      totalStepCount: stepCount + 1,
    });
  } catch (error) {
    console.error("Error fetching onboarding page:", error);
    res.status(500).json({ error: "Failed to fetch onboarding page" });
  }
};

export const updateOnboardingComponent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      throw new Error("User not found");
    }

    const { user, onboardingComponents } = req.body;
    const { userId } = req.user;

    let updatedUser;
    await prisma.$transaction(async (tx) => {
      updatedUser = await tx.user.update({
        where: { userId },
        data: {
          address: user?.address,
          city: user?.city,
          state: user?.state,
          zip: user?.zip,
          birthDate: user?.birthDate,
          aboutMe: user?.aboutMe,
        },
      });

      const onboardingPromises = onboardingComponents.map(
        async (step: { name: OnboardingComponentName }) => {
          const component = await tx.onboardingComponent.findUnique({
            where: { name: step.name },
          });

          if (!component) {
            throw new Error(`Onboarding component ${step.name} not found`);
          }

          return tx.userOnboardingSteps.upsert({
            where: {
              userId_onboardingComponentId: {
                userId,
                onboardingComponentId: component.onboardingComponentId,
              },
            },
            create: {
              userId,
              onboardingComponentId: component.onboardingComponentId,
              completed: true,
              completedAt: new Date(),
            },
            update: {
              completed: true,
              completedAt: new Date(),
            },
          });
        }
      );

      await Promise.all(onboardingPromises);
    });

    const nextOnboardingStep = await getNextOnboardingStep(userId);

    res.json({
      user: updatedUser,
      hasCompletedOnboarding: !nextOnboardingStep,
    });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    res.status(500).json({ error: "Failed to update onboarding information" });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const nextOnboardingStep = await getNextOnboardingStep(user.userId);
    res.json({
      hasCompletedOnboarding: !nextOnboardingStep,
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user onboarding steps:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};

export const setOnboardingStepCount = async (req: Request, res: Response) => {
  try {
    const { stepCount } = req.body;
    await prisma.config.update({
      where: { name: "onboarding_step_count" },
      data: { value: stepCount.toString() },
    });
    res.json({ message: "Step count set" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error setting onboarding step count", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};
