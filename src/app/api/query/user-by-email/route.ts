import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    // Try to find existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        profiles: {
          where: { communityId: community.id },
          take: 1,
        },
      },
    });

    if (existingUser) {
      // User exists, return their data
      return NextResponse.json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
          nickname: existingUser.nickname,
          image: existingUser.profiles[0]?.image || null,
          exists: true,
        },
      });
    } else {
      // User doesn't exist, return email only
      return NextResponse.json({
        user: {
          email,
          nickname: email.split("@")[0], // Generate default nickname from email
          image: null,
          exists: false,
        },
      });
    }
  } catch (error) {
    console.error("Error searching user by email:", error);
    return NextResponse.json(
      { error: "Failed to search user" },
      { status: 500 }
    );
  }
}
