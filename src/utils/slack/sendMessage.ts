import type { ServerEvent } from "src/types";
import type { MessageType } from "./prepareSlackMessage";
import { prepareSlackMessage } from "./prepareSlackMessage";
import { WebClient } from "@slack/web-api";

export const sendMessage = async ({
  event,
  host,
  type,
}: {
  event: ServerEvent;
  host: string;
  type: MessageType;
}) => {
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);
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
  return client.chat.postMessage({
    channel,
    text,
    username,
    icon_emoji: icon,
    blocks,
  });
};
