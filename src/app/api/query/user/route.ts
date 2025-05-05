import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { cookies } from "next/headers";

// This tells Next.js this route should be dynamically rendered
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId } = _.pick(body, ["userId"]);

  // If userId is undefined, try to get it from the session cookie
  let effectiveUserId = userId;
  if (!effectiveUserId) {
    try {
      const sessionCookie = cookies().get("session");
      if (sessionCookie?.value) {
        const sessionData = JSON.parse(sessionCookie.value);
        effectiveUserId = sessionData.id;
      }
    } catch (e) {
      console.error("Error parsing session cookie:", e);
    }
  }

  // Only attempt to query if we have a valid user ID
  if (!effectiveUserId) {
    return NextResponse.json(
      {
        data: null,
        error: "No user ID provided",
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: effectiveUserId,
      },
      include: {
        profile: true, // Include the profile which contains the image
      },
    });

    // Transform the user object to flatten the profile data for easier access
    const userData = user
      ? {
          ...user,
          image: user.profile?.image || null, // Add image directly to the user object
        }
      : null;

    return NextResponse.json({
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        data: null,
        error: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
