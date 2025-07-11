import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";
import { ResonanceSimilarityService } from "src/lib/similarity/resonance-similarity-service";
import type { ResonanceEntry } from "src/lib/similarity/resonance-types";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Finding similar profiles for user ${userId} in community: ${community.displayName}`
    );

    // Get current user's profile to verify they exist in this community
    const currentUserProfile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: "Current user profile not found in this community" },
        { status: 404 }
      );
    }

    // Use the caching service for optimized similarity calculation
    const similarityService = new ResonanceSimilarityService();
    const result = await similarityService.getSimilarProfiles(
      userId,
      community.id,
      6
    );

    console.log(
      `Found ${result.similarProfiles.length} similar profiles for user ${userId} (fromCache: ${result.fromCache}, time: ${result.calculationTime}ms)`
    );

    return NextResponse.json({
      success: true,
      message: `Found ${result.similarProfiles.length} similar profiles`,
      data: {
        similarProfiles: result.similarProfiles,
        currentUser: {
          id: currentUserProfile.userId,
          nickname: currentUserProfile.user.nickname,
          totalResonances: (
            (currentUserProfile.resonance as unknown as ResonanceEntry[]) || []
          ).length,
          bio: currentUserProfile.bio,
        },
        community: {
          id: community.id,
          displayName: community.displayName,
        },
        performance: {
          fromCache: result.fromCache,
          calculationTime: result.calculationTime,
          cacheStats: similarityService.getCacheStats(),
        },
      },
    });
  } catch (error) {
    console.error("Error finding similar profiles:", error);
    return NextResponse.json(
      {
        error: "Failed to find similar profiles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
