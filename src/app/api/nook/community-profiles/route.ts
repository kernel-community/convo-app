import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";
import type { ResonanceEntry } from "src/lib/similarity/resonance-types";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(`Fetching profiles for community: ${community.displayName}`);

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50); // Max 50 per page
    const search = url.searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      communityId: community.id,
    };

    // Add search filter if provided
    if (search.trim()) {
      whereClause.user = {
        nickname: {
          contains: search.trim(),
          mode: "insensitive",
        },
      };
    }

    // Get profiles with pagination
    const [profiles, totalCount] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isCoreMember: "desc" }, // Core members first
          { updatedAt: "desc" }, // Most recently updated
        ],
        skip: offset,
        take: limit,
      }),
      prisma.profile.count({
        where: whereClause,
      }),
    ]);

    // Transform profiles for response
    const transformedProfiles = profiles.map((profile) => {
      const resonanceEntries =
        (profile.resonance as unknown as ResonanceEntry[]) || [];

      return {
        userId: profile.userId,
        nickname: profile.user.nickname,
        bio: profile.bio,
        isCoreMember: profile.isCoreMember,
        totalResonances: resonanceEntries.length,
        lastResonance:
          resonanceEntries.length > 0 ? resonanceEntries[0]?.timestamp : null,
        keywords: profile.keywords,
        currentAffiliation: profile.currentAffiliation,
        city: profile.city,
        url: profile.url,
        socialHandle: profile.socialHandle,
        project: profile.project,
        projectDescription: profile.projectDescription,
        image: profile.image, // Add Clerk profile image
        updatedAt: profile.updatedAt,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    console.log(
      `Found ${profiles.length} profiles (page ${page}/${totalPages}, total: ${totalCount})`
    );

    return NextResponse.json({
      success: true,
      data: {
        profiles: transformedProfiles,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPreviousPage,
        },
        community: {
          id: community.id,
          displayName: community.displayName,
        },
        search: search.trim() || null,
      },
    });
  } catch (error) {
    console.error("Error fetching community profiles:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch community profiles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
