import { isNil } from "lodash";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import isProd from "src/utils/isProd";

export async function POST() {
  const headersList = headers();
  const host = headersList.get("host");

  const subdomain = host?.split(".")[0];

  if (!subdomain) {
    throw new Error("subdomain undefined");
  }
  let community = await prisma.community.findUnique({
    where: { subdomain },
  });
  if (!community) {
    // @note
    // fallback on kernel community if subdomain not found
    community = await prisma.community.findUnique({
      where: { subdomain: isProd(host) ? "kernel" : "staging" },
    });
  }
  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }
  return NextResponse.json({ data: community });
}
