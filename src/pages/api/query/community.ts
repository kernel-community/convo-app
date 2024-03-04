import { isNil, pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import isProd from "src/server/utils/isProd";

export default async function getCurrentCommunity(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headersList = req.headers;
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);
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
  return res.status(200).json({ data: community });
}
