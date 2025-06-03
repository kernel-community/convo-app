import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function GET(req: NextRequest) {
  // Get the nickname from the query parameter
  const url = new URL(req.url);
  const nickname = url.searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json(
      {
        data: null,
        error: "Nickname parameter is required",
      },
      { status: 400 }
    );
  }

  try {
    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Fetching user profile for nickname: ${nickname} in community: ${community.displayName} (${community.subdomain})`
    );

    // Find the user by nickname
    const user = await prisma.user.findFirst({
      where: {
        nickname,
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

    // First try to get the profile for the current community
    let profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: community.id,
        },
      },
    });

    // If no profile exists for this community, fall back to the most recent profile from any community
    if (!profile) {
      console.log(
        `No profile found for user ${nickname} in community ${community.subdomain}, using fallback profile`
      );
      profile = await prisma.profile.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // Return the user with their profile data
    return NextResponse.json({
      data: {
        ...user,
        profile,
      },
    });
  } catch (error) {
    console.error("Error fetching user by nickname:", error);
    return NextResponse.json(
      {
        data: null,
        error: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
