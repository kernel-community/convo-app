import type { NextApiRequest, NextApiResponse } from "next";
import { WebClient } from "@slack/web-api";
import { prisma } from "src/server/db";
import { pick } from "lodash";
import { prepareSlackMessage } from "src/server/utils/slack/prepareSlackMessage";

export default async function notifyAll(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[api] actions/slack/notifyAll");
  const headersList = req.headers;

  // fetch all bots from database
  // trigger message

  const { eventId, type } = pick(req.body, ["eventId", "type"]);
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);

  const prodHost = process.env.PROD_HOST;
  if (!prodHost) {
    throw new Error("set prodHost in .env -- the host of the app in prod");
  }

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
    },
  });

  if (!event) {
    throw new Error("event not found");
  }

  const { blocks, text, icon, username } = prepareSlackMessage({
    event,
    reqHost: host || prodHost,
    type, // "new" | "reminder" | "updated"
  });

  let bots,
    skip = 0,
    pageNumber = 1;
  const take = 4;
  do {
    bots = await prisma.slack.findMany({
      take,
      skip,
    });
    // send message to via all these bots
    const clientsAndChannels = bots.map((bot) => {
      return {
        client: new WebClient(bot.botToken),
        channel: bot.channel,
      };
    });
    try {
      const sendMessagesPromises = clientsAndChannels.map((obj) => {
        return obj.client.chat.postMessage({
          channel: obj.channel,
          text,
          username,
          icon_emoji: icon,
          blocks,
        });
      });
      await Promise.all(sendMessagesPromises);
    } catch (err) {
      // do nothing, just log error and move on :)
      console.log("there was an error", err);
    }
    skip = pageNumber * bots.length;
    pageNumber++;
  } while (bots.length > 0);

  return res.status(200).json({});
}
