import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";

// This tells Next.js this route should be dynamically rendered
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use Clerk's auth() helper to get the authenticated user
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { hasBetaAccess: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the user from the database to check their email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, isBeta: true },
    });

    // Check if the user's email is in the BETA_USERS list from flags.ts
    let hasBetaAccess = false;
    if (user?.email) {
      const email = user.email.toLowerCase();
      hasBetaAccess =
        user.isBeta ||
        email.endsWith("@convo.cafe") ||
        email.endsWith("@kernel.community");
    }

    return NextResponse.json({ hasBetaAccess });
  } catch (error) {
    console.error("Error checking beta access:", error);
    return NextResponse.json(
      { hasBetaAccess: false, message: "Server error" },
      { status: 500 }
    );
  }
}
