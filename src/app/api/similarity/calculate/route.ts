import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SimilarityService } from "src/lib/similarity/similarity-service";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId: targetUserId, action = "all" } = body;

    const similarityService = new SimilarityService();

    if (action === "all") {
      // Calculate similarities for all users
      console.log("🔄 Starting full similarity calculation...");
      const result =
        await similarityService.calculateAndUpdateAllSimilarities();

      return NextResponse.json({
        success: true,
        message: "Similarity calculation completed",
        data: result,
      });
    } else if (action === "user" && targetUserId) {
      // Calculate similarities for a specific user
      console.log(`🔄 Calculating similarities for user ${targetUserId}...`);
      const result = await similarityService.recalculateSimilaritiesForUser(
        targetUserId
      );

      return NextResponse.json({
        success: true,
        message: `Similarity calculation completed for user ${targetUserId}`,
        data: result,
      });
    } else if (action === "stats") {
      // Get network similarity statistics
      const stats = await similarityService.getNetworkSimilarityStats();

      return NextResponse.json({
        success: true,
        message: "Network similarity statistics retrieved",
        data: stats,
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid action or missing userId for user-specific calculation",
          validActions: ["all", "user", "stats"],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in similarity calculation:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId1 = searchParams.get("userId1");
    const userId2 = searchParams.get("userId2");

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: "Both userId1 and userId2 are required" },
        { status: 400 }
      );
    }

    const similarityService = new SimilarityService();
    const similarity = await similarityService.getSimilarityBreakdown(
      userId1,
      userId2
    );

    if (!similarity) {
      return NextResponse.json(
        { error: "One or both users not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: similarity,
    });
  } catch (error) {
    console.error("Error getting similarity breakdown:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
