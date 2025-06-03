import type { NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import _ from "lodash";
import type { Profile } from "@prisma/client";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId } = _.pick(body, ["userId"]);

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required to fetch profile" },
      { status: 400 }
    );
  }

  try {
    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Fetching profile for user: ${userId} in community: ${community.displayName} (${community.subdomain})`
    );

    // First check if profile exists for this user-community combination
    let profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
    });

    // If profile doesn't exist for this community, get user data from other profiles to pre-populate
    if (!profile) {
      console.log(
        `No profile found for user ${userId} in community ${community.subdomain}, checking for existing profiles to pre-populate`
      );

      // Get the most recent profile from any other community for this user
      const existingProfile = await prisma.profile.findFirst({
        where: {
          userId,
          // Exclude current community to avoid conflicts
          communityId: { not: community.id },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Create a new profile for this community, optionally pre-populated with existing data
      const createData = {
        keywords: [],
        // Connect to user and community using Prisma relations
        user: { connect: { id: userId } },
        community: { connect: { id: community.id } },
        // Pre-populate with data from existing profile if available
        ...(existingProfile && {
          bio: existingProfile.bio,
          url: existingProfile.url,
          socialHandle: existingProfile.socialHandle,
          currentAffiliation: existingProfile.currentAffiliation,
          project: existingProfile.project,
          projectDescription: existingProfile.projectDescription,
          projectUrl: existingProfile.projectUrl,
          city: existingProfile.city,
          keywords: existingProfile.keywords,
          // Note: We don't copy image as it might be community-specific
        }),
      };

      console.log(
        `Creating new profile for user: ${userId} in community: ${
          community.subdomain
        }${existingProfile ? " (pre-populated with existing data)" : ""}`
      );

      profile = await prisma.profile.create({
        data: createData,
      });
    }

    return NextResponse.json({
      data: {
        ...profile,
        image: profile?.image,
      } as Profile,
    });
  } catch (error) {
    console.error("Error in profile query:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      userId,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch or create profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
