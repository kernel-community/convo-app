import { NextResponse } from "next/server";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST() {
  try {
    // Use the centralized utility to get community from subdomain
    const community = await getCommunityFromSubdomain();
    return NextResponse.json({ data: community });
  } catch (error) {
    console.error("Error resolving community:", error);
    return NextResponse.json(
      { error: "Failed to resolve community" },
      { status: 500 }
    );
  }
}
