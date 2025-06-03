import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function GET(req: NextRequest) {
  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    return NextResponse.json({
      community: {
        id: community.id,
        displayName: community.displayName,
        subdomain: community.subdomain,
        description: community.description,
      },
    });
  } catch (error) {
    console.error("Error fetching current community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community information" },
      { status: 500 }
    );
  }
}
