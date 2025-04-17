import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");
  const userId = searchParams.get("userId");

  if (!nickname) {
    return NextResponse.json(
      { error: "Nickname is required" },
      { status: 400 }
    );
  }

  // userId is optional but helpful to exclude the current user from the check

  try {
    const query: any = {
      where: {
        nickname: {
          equals: nickname,
          mode: "insensitive", // Case-insensitive check
        },
      },
    };

    // If userId is provided, exclude that user from the search
    if (userId) {
      query.where.NOT = {
        id: userId,
      };
    }

    const existingUser = await prisma.user.findFirst(query);

    return NextResponse.json({ isUnique: !existingUser });
  } catch (error) {
    console.error("Error checking nickname uniqueness:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
