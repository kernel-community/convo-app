import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";

// This tells Next.js this route should be dynamically rendered
export const dynamic = "force-dynamic";

// Session cookie name (must match the one used in the auth system)
const SESSION_COOKIE = "session";

export async function GET() {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get(SESSION_COOKIE);

    // Check if the cookie exists and is valid
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { hasBetaAccess: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      // Parse the cookie value to verify it's valid JSON
      const sessionData = JSON.parse(sessionCookie.value);

      // Check if the session contains the expected user data
      if (!sessionData || !sessionData.id) {
        return NextResponse.json(
          { hasBetaAccess: false, message: "Invalid session" },
          { status: 401 }
        );
      }

      const userId = sessionData.id;

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
    } catch (e) {
      // Invalid JSON in cookie
      console.error("Invalid session cookie format:", e);
      return NextResponse.json(
        { hasBetaAccess: false, message: "Invalid session format" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error checking beta access:", error);
    return NextResponse.json(
      { hasBetaAccess: false, message: "Server error" },
      { status: 500 }
    );
  }
}
