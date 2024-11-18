import { prisma } from "../prisma";

export const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { userId: parseInt(userId) },
  });
  return user;
};
