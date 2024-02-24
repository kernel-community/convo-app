import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from "@slack/web-api";
import { prisma } from "src/server/db";
import { pick } from "lodash";
import { prepareSlackMessage } from "src/server/utils/slack/prepareSlackMessage";
import { DEFAULT_HOST } from "src/utils/constants";

export default async function notify(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[api] actions/slack/notify");
  const headersList = req.headers;
  const { eventId, type } = pick(req.body, ["eventId", "type"]);
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
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
  return res.status(200).json({});
}
