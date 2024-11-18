import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUser } from "../services/users";
const jwtSecretKey = process.env.JWT_SECRET_KEY!;
import { User as UserType } from "@prisma/client";

type UserWithoutPassword = Omit<UserType, "password">;

export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecretKey) as { userId: string };
    const userId = decoded.userId;

    const user = await getUser(userId);

    if (!user) {
      throw new Error("User not found");
    }
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
