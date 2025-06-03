import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { cookies } from "next/headers";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

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
    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Fetching user data for user: ${effectiveUserId} in community: ${community.displayName} (${community.subdomain})`
    );

    // Fetch the user
    const user = await prisma.user.findUnique({
      where: {
        id: effectiveUserId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Try to get the profile for the current community
    let profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId: effectiveUserId,
          communityId: community.id,
        },
      },
    });

    // If no profile exists for this community, fall back to the most recent profile from any community
    if (!profile) {
      console.log(
        `No profile found for user ${effectiveUserId} in community ${community.subdomain}, using fallback profile`
      );
      profile = await prisma.profile.findFirst({
        where: {
          userId: effectiveUserId,
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // Transform the user object to include the profile data for easier access
    const userData = {
      ...user,
      profile,
      image: profile?.image || null, // Add image directly to the user object for backward compatibility
    };

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
