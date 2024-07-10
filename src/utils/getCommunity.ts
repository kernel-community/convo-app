import { prisma } from "src/utils/db";
import isProd from "./isProd";
import { isNil } from "lodash";

export default async function getCommunity(host: string) {
  const subdomain = host?.split(".")[0];
  let community = await prisma.community.findUnique({ where: { subdomain } });
  if (!community || isNil(community)) {
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
  return community;
}
