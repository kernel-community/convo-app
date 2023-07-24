import type { ServerEvent } from "src/types";

const DEFAULT_USERNAME = "New convo scheduled";
const DEFAULT_TEXT = "New Convo Alert";

type SlackEventMessage = {
  blocks: SlackMessageBlocks[];
  icon?: string;
  username: string;
  text: string;
};
type SlackMessageBlocks = {
  type: string;
  elements?: object[];
  text?: object;
};

export const prepareSlackMessage = ({
  event,
  reqHost,
}: {
  event: ServerEvent;
  reqHost: string;
}): SlackEventMessage => {
  const { title, descriptionHtml, hash, proposer } = event;
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${reqHost}/rsvp/${hash}`;

  const blocks: SlackMessageBlocks[] = [];
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${proposer.nickname}*` + ` has proposed a new Convo!`,
    },
  });
  blocks.push({
    type: "divider",
  });
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${title}*\n${descriptionHtml}`,
    },
  });
  if (event.series) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*_This event is part of a series_*",
      },
    });
  }
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Read more",
          emoji: true,
        },
        value: "click-0",
        action_id: "actionId-0",
        url,
      },
    ],
  });
  return {
    blocks,
    username: DEFAULT_USERNAME,
    text: DEFAULT_TEXT,
  };
};
