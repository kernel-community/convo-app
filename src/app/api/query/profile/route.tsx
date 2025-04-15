import type { NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import _ from "lodash";
import type { Profile } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId } = _.pick(body, ["userId"]);

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required to fetch profile" },
      { status: 400 }
    );
  }

  try {
    // First check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    // If profile doesn't exist, create a new one
    if (!profile) {
      console.log(`Creating new profile for user: ${userId}`);
      profile = await prisma.profile.create({
        data: {
          userId,
          keywords: [],
        },
      });
    }

    return NextResponse.json({
      data: {
        ...profile,
        image: profile?.image,
      } as Profile,
    });
  } catch (error) {
    console.error("Error in profile query:", error);
    return NextResponse.json(
      { error: "Failed to fetch or create profile" },
      { status: 500 }
    );
  }
}
