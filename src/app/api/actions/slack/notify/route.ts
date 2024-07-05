import { WebClient } from "@slack/web-api";
import { prisma } from "src/server/db";
import { pick } from "lodash";
import { prepareSlackMessage } from "src/server/utils/slack/prepareSlackMessage";
import { DEFAULT_HOST } from "src/utils/constants";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  console.log("[api] actions/slack/notify");
  const headersList = headers();
  const body = await req.json();
  const { eventId, type } = pick(body, ["eventId", "type"]);
  const host = headersList.get("host") ?? "kernel";
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: {
            include: {
              profile: true,
            },
          },
        },
      },
      collections: true,
      community: {
        include: {
          google: true,
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
