import type { ServerEvent } from "src/types";
import { stripHtml } from "string-strip-html";

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

export type MessageType = "new" | "reminder" | "updated";

const getUsernameAndText = (
  type: MessageType
): { text: string; icon: string } => {
  switch (type) {
    case "new": {
      return { text: "New Convo", icon: ":speech_balloon:" };
    }
    case "reminder": {
      return { text: "Reminder", icon: ":mantelpiece_clock:" };
    }
    case "updated": {
      return { text: "Convo Updated", icon: ":new_moon_with_face:" };
    }
  }
};

export const prepareSlackMessage = ({
  event,
  reqHost,
  type,
}: {
  event: ServerEvent;
  reqHost: string;
  type: MessageType;
}): SlackEventMessage => {
  const { title, descriptionHtml, hash, proposers } = event;
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const url = `${protocol}://${reqHost}/rsvp/${hash}`;
  const parsedDescription = stripHtml(descriptionHtml ?? "").result;
  const description =
    `${parsedDescription.substring(0, 250)}` +
    `${parsedDescription.length > 250 ? "..." : ""}`;

  const { text, icon } = getUsernameAndText(type);

  // Format proposer string based on the number of proposers
  let proposerString = "";
  if (proposers.length === 1) {
    proposerString = `Convo by *${proposers[0]?.user.nickname ?? "Host"}*`;
  } else if (proposers.length === 2) {
    proposerString = `Convo by *${
      proposers[0]?.user.nickname ?? "Host"
    }* and *${proposers[1]?.user.nickname ?? "Host"}*`;
  } else if (proposers.length > 2) {
    const remaining = proposers.length - 2;
    proposerString = `Convo by *${proposers[0]?.user.nickname ?? "Host"}*, *${
      proposers[1]?.user.nickname ?? "Host"
    }* and ${remaining} other${remaining > 1 ? "s" : ""}`;
  } else {
    proposerString = "Convo by *Host*"; // Fallback if no proposers
  }

  const blocks: SlackMessageBlocks[] = [];
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: proposerString, // Use the dynamically generated string
    },
  });
  blocks.push({
    type: "divider",
  });
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${title}*\n${description}`,
    },
  });
  blocks.push({
    type: "divider",
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
  blocks.push({
    type: "divider",
  });
  return {
    blocks,
    username: text,
    text,
    icon,
  };
};
