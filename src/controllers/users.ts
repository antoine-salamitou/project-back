import { prisma } from "../prisma";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getNextOnboardingStep } from "../services/onboarding";
import bcrypt from "bcrypt";

export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};

export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "24h" }
    );

    const nextOnboardingStep = await getNextOnboardingStep(user.userId);

    res.json({
      token,
      user,
      hasCompletedOnboarding: !nextOnboardingStep,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error signing in user:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        birthDate: true,
        aboutMe: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
};
