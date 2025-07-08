import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { getDefaultProfilePicture } from "src/utils/constants";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function GET() {
  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    // Query all users with community-specific profiles
    const users = await prisma.user.findMany({
      where: {
        profiles: {
          some: {
            communityId: community.id,
          },
        },
      },
      select: {
        id: true,
        nickname: true,
        profiles: {
          where: {
            communityId: community.id,
          },
          take: 1,
          select: {
            bio: true,
            image: true,
            keywords: true,
            currentAffiliation: true,
            city: true,
            socialHandle: true,
            project: true,
            projectDescription: true,
            url: true,
          },
        },
      },
      orderBy: {
        nickname: "asc",
      },
    });

    // Transform data for frontend consumption
    const directoryProfiles = users.map((user) => {
      const profile = user.profiles?.[0] || null;
      const defaultImage = getDefaultProfilePicture(user.id);

      return {
        id: user.id,
        nickname: user.nickname || "Anonymous",
        bio: profile?.bio || null,
        image: profile?.image || defaultImage,
        keywords: profile?.keywords || [],
        currentAffiliation: profile?.currentAffiliation || null,
        city: profile?.city || null,
        socialHandle: profile?.socialHandle || null,
        project: profile?.project || null,
        projectDescription: profile?.projectDescription || null,
        url: profile?.url || null,
      };
    });

    return NextResponse.json({
      profiles: directoryProfiles,
      communityName: community.displayName,
    });
  } catch (error) {
    console.error("Error fetching directory profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch directory profiles" },
      { status: 500 }
    );
  }
}
