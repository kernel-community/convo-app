import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, weather, energy, timestamp } = body;

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Get the current community from subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Storing resonance for user ${userId} in community: ${community.displayName} (${community.subdomain})`
    );

    // Create the resonance entry
    const resonanceEntry = {
      text: text.trim(),
      weather,
      energy,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Try to find existing profile for this user in this community
    const profile = await prisma.profile.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: community.id,
        },
      },
    });

    if (profile) {
      // Update existing profile by appending to resonance array
      await prisma.profile.update({
        where: {
          userId_communityId: {
            userId,
            communityId: community.id,
          },
        },
        data: {
          resonance: {
            push: resonanceEntry,
          },
        },
      });
      console.log("Resonance appended to existing profile");
    } else {
      // Create new profile with the resonance entry
      await prisma.profile.create({
        data: {
          userId,
          communityId: community.id,
          resonance: [resonanceEntry],
          // Set default values for required fields
          keywords: [],
        },
      });
      console.log("Created new profile with resonance entry");
    }

    console.log("Resonance data stored successfully:", resonanceEntry);

    return NextResponse.json({
      success: true,
      message: "Resonance stored successfully",
      data: {
        ...resonanceEntry,
        communityId: community.id,
        userId,
      },
    });
  } catch (error) {
    console.error("Error processing resonance:", error);
    return NextResponse.json(
      { error: "Failed to process resonance" },
      { status: 500 }
    );
  }
}
