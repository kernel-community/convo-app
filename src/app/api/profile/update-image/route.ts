import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getPublicS3Url } from "src/utils/s3";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(req: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId: authenticatedUserId } = await auth();
    if (!authenticatedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();
    const { userId, fileKey } = body;

    // Validate request
    if (!userId || !fileKey) {
      return NextResponse.json(
        { error: "Missing userId or fileKey" },
        { status: 400 }
      );
    }

    // Ensure user can only update their own profile
    if (userId !== authenticatedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Updating profile image for user: ${userId} in community: ${community.displayName} (${community.subdomain})`
    );

    // Get the full S3 URL
    const imageUrl = getPublicS3Url(fileKey);

    // Update or create profile with the new image URL for this specific user-community combination
    const profile = await prisma.profile.upsert({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
      create: {
        image: imageUrl,
        keywords: [],
        user: { connect: { id: userId } },
        community: { connect: { id: community.id } },
      },
      update: {
        image: imageUrl,
      },
      include: { user: true, community: true },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}
