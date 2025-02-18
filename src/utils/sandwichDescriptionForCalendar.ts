import { EVENT_ORGANIZER_NAME } from "./constants";

export const sandwichDescriptionForCalendar = (
  description: string,
  hash: string,
  proposer: string,
  recipientEmail: string,
  recipientName: string
) => {
  return `This is a Convo calendar invite for <b>${recipientName}</b> (${recipientEmail}). Any changes made to this invite will only be reflected on their calendar.<br /><br/><b>The latest details for this Convo are viewable and editable here: <a href="https://convo.cafe/${hash}">convo.cafe/rsvp/${hash}</a></b><br />${description}${
    proposer === EVENT_ORGANIZER_NAME
      ? ""
      : `<br/>Signed by <b>${proposer}</b><br />`
  }`;
};
