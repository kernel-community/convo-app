import { prisma } from "../db";

export const createUserFromAddress = async (address: string) => {
  const alreadyExists = await prisma.user.findUnique({
    where: {
      address,
    },
  });
  if (alreadyExists) {
    console.log(
      `[createUserFromAddress] User found. Logging in ${JSON.stringify(
        alreadyExists
      )}`
    );
    return;
  }
  const user = await prisma.user.create({
    data: {
      address,
    },
  });
  console.log(
    `[createUserFromAddress] created account ${JSON.stringify(user)}`
  );
  return;
};
