import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// This tells Next.js this route should be dynamically rendered
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use Clerk's auth() helper to get the authenticated user
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { hasFellowAccess: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();

    // Check if user has a profile with isCoreMember set to true in this community
    const profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
      select: { isCoreMember: true },
    });

    const hasFellowAccess = profile?.isCoreMember || false;

    return NextResponse.json({ hasFellowAccess });
  } catch (error) {
    console.error("Error checking fellow access:", error);
    return NextResponse.json(
      { hasFellowAccess: false, message: "Server error" },
      { status: 500 }
    );
  }
}
