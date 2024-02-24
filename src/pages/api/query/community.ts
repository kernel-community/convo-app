import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

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
  const community = await prisma.community.findUnique({
    where: { subdomain },
  });
  return res.status(200).json({ data: community });
}
