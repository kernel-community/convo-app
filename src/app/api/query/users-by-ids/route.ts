import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { Prisma } from "@prisma/client";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// Expected structure for the response items
type ProposerInfo = {
  id: string;
  nickname: string | null;
  image?: string | null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json(
      { error: "'ids' query parameter is required" },
      { status: 400 }
    );
  }

  // Split the comma-separated string into an array of IDs
  const userIds = idsParam.split(",").filter((id) => id.trim() !== "");

  if (userIds.length === 0) {
    return NextResponse.json({ users: [] }); // Return empty if no valid IDs provided
  }

  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
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
            image: true,
          },
        },
      },
    });

    // Format the result to match ProposerInfo structure
    const formattedUsers: ProposerInfo[] = users.map((user) => ({
      id: user.id,
      nickname: user.nickname ?? null, // Ensure nickname is null if missing
      image: user.profiles[0]?.image ?? null, // Handle community-specific profile image
    }));

    // Optional: Maintain original order if needed (Prisma doesn't guarantee order)
    // If order matters, create a map and reorder
    // const userMap = new Map(formattedUsers.map(u => [u.id, u]));
    // const orderedUsers = userIds.map(id => userMap.get(id)).filter(Boolean);

    return NextResponse.json({ users: formattedUsers }); // Return potentially unordered list
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    // Handle potential Prisma errors (e.g., invalid ID format)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2023") {
        // Example: Invalid ID format
        return NextResponse.json(
          { error: "Invalid user ID format provided" },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
