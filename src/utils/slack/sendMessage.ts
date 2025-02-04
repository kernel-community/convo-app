import type { ServerEvent } from "src/types";
import type { MessageType } from "./prepareSlackMessage";
import { prepareSlackMessage } from "./prepareSlackMessage";
import { WebClient } from "@slack/web-api";
import { prisma } from "src/utils/db";
export const sendMessage = async ({
  event,
  host,
  type,
}: {
  event: ServerEvent;
  host: string;
  type: MessageType;
}) => {
  const { blocks, text, icon, username } = prepareSlackMessage({
    event,
    reqHost: host,
    type,
  });
  const bot = event.community?.slack?.botToken;
  const channel = event.community?.slack?.channel;
  if (!bot || !channel) {
    throw new Error(
      "bot or channel undefined. check config for the community in database"
    );
  }
  const client = new WebClient(bot);
  try {
    if (type === "new") {
      const posted = await client.chat.postMessage({
        channel,
        text,
        username,
        icon_emoji: icon,
        blocks,
      });
      if (!event.community?.slack?.id) {
        throw new Error("community slack id undefined");
      }
      if (!posted.ts) {
        throw new Error("posted ts undefined");
      }
      await prisma.postedSlackMessage.upsert({
        where: {
          eventId_slackId: {
            eventId: event.id,
            slackId: event.community?.slack?.id,
          },
        },
        update: {},
        create: {
          eventId: event.id,
          slackId: event.community?.slack?.id,
          ts: posted.ts,
        },
      });
      return posted;
    }
  } catch (error) {
    console.log("Error sending new slack message");
    console.log(error);
  }

  try {
    if (type === "updated") {
      if (!event.community?.slack?.id) {
        throw new Error("community slack id undefined");
      }
      const { ts } = await prisma.postedSlackMessage.findUniqueOrThrow({
        where: {
          eventId_slackId: {
            eventId: event.id,
            slackId: event.community?.slack?.id,
          },
        },
        select: {
          ts: true,
        },
      });
      const posted = await client.chat.postMessage({
        channel,
        text,
        username,
        icon_emoji: icon,
        blocks,
        thread_ts: ts,
      });
      if (!posted.ts) {
        throw new Error("posted ts undefined");
      }
      return posted;
    }
  } catch (err) {
    console.log("Error sending message in thread");
    console.log(err);
  }
};
