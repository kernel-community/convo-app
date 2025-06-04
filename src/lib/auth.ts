import { auth } from "@clerk/nextjs/server";

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}
