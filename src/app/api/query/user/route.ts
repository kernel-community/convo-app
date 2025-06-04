import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { auth } from "@clerk/nextjs/server";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// This tells Next.js this route should be dynamically rendered
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Use Clerk's authentication with the correct await
    const { userId: clerkUserId } = await auth();

    // Parse the request body to get userId (might be the same as clerkUserId)
    const body = await req.json();
    const { userId } = body;

    // Ensure user can only query their own data or use their authenticated ID
    const targetUserId = userId || clerkUserId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "No user ID provided and not authenticated" },
        { status: 400 }
      );
    }

    // If a specific userId was provided, ensure it matches the authenticated user
    if (userId && userId !== clerkUserId) {
      return NextResponse.json(
        { error: "Cannot access other user's data" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Fetching user data for user: ${targetUserId} in community: ${community.displayName} (${community.subdomain})`
    );

    // Try to get the profile for the current community
    let profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId: targetUserId,
          communityId: community.id,
        },
      },
    });

    // If no profile exists for this community, fall back to the most recent profile from any community
    if (!profile) {
      console.log(
        `No profile found for user ${targetUserId} in community ${community.subdomain}, using fallback profile`
      );
      profile = await prisma.profile.findFirst({
        where: {
          userId: targetUserId,
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

    return NextResponse.json({ data: userData });
  } catch (error) {
    console.error("Error in user query:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
