import { NextRequest, NextResponse } from "next/server";
import { prisma } from "src/utils/db";

export async function GET(req: NextRequest) {
  // Get the nickname from the query parameter
  const url = new URL(req.url);
  const nickname = url.searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json(
      {
        data: null,
        error: "Nickname parameter is required",
      },
      { status: 400 }
    );
  }

  try {
    // Find the user by nickname using findFirst instead of findUnique
    // since nickname might not be set as a unique field in the schema
    const user = await prisma.user.findFirst({
      where: {
        nickname,
      },
      include: {
        profile: true, // Include the profile data
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Return the user with their profile data
    return NextResponse.json({
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by nickname:", error);
    return NextResponse.json(
      {
        data: null,
        error: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
