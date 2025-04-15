import { type Profile } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";

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
    };

    // Update or create profile
    const updated = await prisma.profile.upsert({
      where: { userId },
      create: {
        bio: sanitizedProfile.bio,
        image: sanitizedProfile.image,
        keywords: sanitizedProfile.keywords,
        url: sanitizedProfile.url,
        currentAffiliation: sanitizedProfile.currentAffiliation,
        user: { connect: { id: userId } },
      },
      update: sanitizedProfile,
      include: { user: true },
    });

    // Log success
    console.log(`Updated profile for user: ${updated.user.nickname}`);

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
