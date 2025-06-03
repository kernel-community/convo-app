import { type Profile } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

type ProfileUpdateRequest = {
  profile: Partial<Profile> & { userId: string };
};

/**
 * Validates the profile update request
 */
function validateProfileRequest(
  request: unknown
): request is ProfileUpdateRequest {
  if (!request || typeof request !== "object") return false;

  const { profile } = request as Record<string, unknown>;

  if (!profile || typeof profile !== "object") return false;
  if (
    !("userId" in profile) ||
    typeof profile.userId !== "string" ||
    !profile.userId
  )
    return false;

  return true;
}

/**
 * API endpoint to update or create a user profile
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();

    if (!validateProfileRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request. Profile with userId is required" },
        { status: 400 }
      );
    }

    const { profile } = body;
    const { userId } = profile;

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Updating profile for user: ${userId} in community: ${community.displayName} (${community.subdomain})`
    );

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${userId} not found` },
        { status: 404 }
      );
    }

    // Process profile data
    const sanitizedProfile = {
      ...profile,
      keywords: Array.isArray(profile.keywords) ? profile.keywords : [],
      // Ensure communityId is set to current community
      communityId: community.id,
    };

    // Prepare update data (exclude fields that shouldn't be updated and handle undefined values)
    const updateData: any = {};
    if (sanitizedProfile.bio !== undefined)
      updateData.bio = sanitizedProfile.bio;
    if (sanitizedProfile.image !== undefined)
      updateData.image = sanitizedProfile.image;
    if (sanitizedProfile.keywords !== undefined)
      updateData.keywords = sanitizedProfile.keywords;
    if (sanitizedProfile.url !== undefined)
      updateData.url = sanitizedProfile.url;
    if (sanitizedProfile.socialHandle !== undefined)
      updateData.socialHandle = sanitizedProfile.socialHandle;
    if (sanitizedProfile.currentAffiliation !== undefined)
      updateData.currentAffiliation = sanitizedProfile.currentAffiliation;
    if (sanitizedProfile.project !== undefined)
      updateData.project = sanitizedProfile.project;
    if (sanitizedProfile.projectDescription !== undefined)
      updateData.projectDescription = sanitizedProfile.projectDescription;
    if (sanitizedProfile.projectUrl !== undefined)
      updateData.projectUrl = sanitizedProfile.projectUrl;
    if (sanitizedProfile.city !== undefined)
      updateData.city = sanitizedProfile.city;
    if (sanitizedProfile.uploadUrl !== undefined)
      updateData.uploadUrl = sanitizedProfile.uploadUrl;
    if (sanitizedProfile.uploadFileName !== undefined)
      updateData.uploadFileName = sanitizedProfile.uploadFileName;
    if (sanitizedProfile.uploadMimeType !== undefined)
      updateData.uploadMimeType = sanitizedProfile.uploadMimeType;
    if (
      sanitizedProfile.customData !== undefined &&
      sanitizedProfile.customData !== null
    ) {
      updateData.customData = sanitizedProfile.customData;
    }

    // Update or create profile for this specific user-community combination
    const updated = await prisma.profile.upsert({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
      create: {
        ...updateData,
        user: { connect: { id: userId } },
        community: { connect: { id: community.id } },
      },
      update: updateData,
    });

    // Log success
    console.log(
      `Updated profile for user: ${userId} in community: ${community.displayName}`
    );

    return NextResponse.json({
      data: updated,
      message: "Profile updated successfully",
    });
  } catch (error) {
    // Detailed error logging
    console.error("Profile update failed:", error);

    // Determine if it's a Prisma error
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
