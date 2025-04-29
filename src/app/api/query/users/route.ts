import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search");

  if (!query || query.length < 2) {
    // Require at least 2 characters to search
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        nickname: {
          contains: query,
          mode: Prisma.QueryMode.insensitive, // Case-insensitive search
        },
        // Optional: Add other filters if needed, e.g., exclude existing proposers?
      },
      select: {
        id: true,
        nickname: true,
        profile: {
          select: {
            image: true,
          },
        },
      },
      take: 10, // Limit results for performance
      orderBy: {
        nickname: "asc", // Optional: order results
      },
    });

    // Format the result slightly for easier frontend use
    const formattedUsers = users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      image: user.profile?.image || null, // Handle potentially null profile/image
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
