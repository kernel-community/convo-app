import { WebClient } from "@slack/web-api";
import { prisma } from "src/utils/db";
import { pick } from "lodash";
import { prepareSlackMessage } from "src/utils/slack/prepareSlackMessage";
import { DEFAULT_HOST } from "src/utils/constants";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(req: NextRequest) {
  console.log("[api] services/slack/notify");
  const headersList = headers();
  const body = await req.json();
  const { eventId, type } = pick(body, ["eventId", "type"]);
  const host = headersList.get("host") ?? "kernel";

  // Get the community for the current subdomain
  const community = await getCommunityFromSubdomain();

  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      proposers: {
        include: {
          user: {
            include: {
              profiles: {
                where: { communityId: community.id },
                take: 1,
              },
            },
          },
        },
      },
      rsvps: {
        include: {
          attendee: {
            include: {
              profiles: {
                where: { communityId: community.id },
                take: 1,
              },
            },
          },
        },
      },
      collections: true,
      community: {
        include: {
          slack: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("event not found");
  }

  const { blocks, text, icon, username } = prepareSlackMessage({
    event,
    reqHost: host || DEFAULT_HOST,
    type, // "new" | "reminder" | "updated"
  });
  const bot = event.community?.slack?.botToken;
  const channel = event.community?.slack?.channel;
  if (!bot || !channel) {
    throw new Error(
      "bot or channel undefined. check config for the community in database"
    );
  }
  const client = new WebClient(bot);
  await client.chat.postMessage({
    channel,
    text,
    username,
    icon_emoji: icon,
    blocks,
  });
  return NextResponse.json({});
}
