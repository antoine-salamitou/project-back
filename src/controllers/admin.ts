import { Request, Response } from "express";
import { prisma } from "../prisma";
import { OnboardingComponent, OnboardingComponentName } from "@prisma/client";
import _ from "lodash";
import { getOnboardingStepCount } from "../utils";
// const AVAILABLE_COMPONENTS: OnboardingComponentName[] = [
//   "aboutMe",
//   "address",
//   "birthDate",
// ];

export const getAdminConfig = async (req: Request, res: Response) => {
  try {
    const onboardingStepCount = await getOnboardingStepCount();

    const onboardingComponents = await prisma.onboardingComponent.findMany({
      select: {
        name: true,
        stepIndex: true,
        isActive: true,
      },
    });
    res.json({
      onboardingComponents,
      totalStepCount: onboardingStepCount,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      console.error("Error fetching onboarding components:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};

export const updateAdminConfig = async (req: Request, res: Response) => {
  try {
    const onboardingStepCount = await getOnboardingStepCount();

    const components = req.body as OnboardingComponent[];
    const filteredComponents = components.filter(
      (comp) => comp.stepIndex <= onboardingStepCount
    );

    if (!Array.isArray(filteredComponents)) {
      throw new Error(
        "Invalid request format. Expected an array of components."
      );
    }

    //uncomment if we want to check if all components are used at least once
    // const usedComponents = new Set(
    //   filteredComponents.filter((c) => c.isActive).map((comp) => comp.name)
    // );
    // const missingComponents = AVAILABLE_COMPONENTS.filter(
    //   (comp) => !usedComponents.has(comp)
    // );
    // console.log(missingComponents, "missingComponents");
    // if (missingComponents.length > 0) {
    //   throw new Error(
    //     `All components must be used at least once. Missing: ${missingComponents.join(
    //       ", "
    //     )}`
    //   );
    // }

    const groupedByPage = _.chain(filteredComponents)
      .filter((c) => c.isActive)
      .groupBy("stepIndex")
      .value();

    const emptyPages =
      Object.keys(groupedByPage).length !== onboardingStepCount;

    if (emptyPages) {
      throw new Error(`Each page must have at least one component.`);
    }

    const updatedComponents = await prisma.$transaction(async (tx) => {
      await tx.onboardingComponent.updateMany({ data: { isActive: false } });

      await Promise.all(
        filteredComponents.map((comp) =>
          tx.onboardingComponent.update({
            where: { name: comp.name },
            data: {
              stepIndex: comp.stepIndex,
              isActive: comp.isActive,
            },
          })
        )
      );

      return tx.onboardingComponent.findMany();
    });

    res.json({
      message: "Configuration updated successfully",
      onboardingComponents: updatedComponents,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating onboarding components:", error.message);
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  }
};
