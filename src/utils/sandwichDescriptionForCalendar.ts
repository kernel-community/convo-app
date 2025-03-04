import { EVENT_ORGANIZER_NAME } from "./constants";

export const sandwichDescriptionForCalendar = (
  description: string,
  hash: string,
  proposer: string,
  recipientEmail: string,
  recipientName: string
) => {
  return `<b>Update your RSVP & see the latest details here: <a href="https://convo.cafe/rsvp/${hash}">convo.cafe/rsvp/${hash}</a></b><br />${description}${
    proposer === EVENT_ORGANIZER_NAME
      ? ""
      : `<br/>Signed (& hosted) by <b>${proposer}.</b><br />`
  }`;
};
