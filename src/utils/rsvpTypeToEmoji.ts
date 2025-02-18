import { RSVP_TYPE } from "@prisma/client";

export const rsvpTypeToEmoji = (rsvpType: RSVP_TYPE) => {
  switch (rsvpType) {
    case RSVP_TYPE.GOING:
      return "✅";
    case RSVP_TYPE.NOT_GOING:
      return "❌";
    case RSVP_TYPE.MAYBE:
      return "🤷";
    default:
      return "❔";
  }
};
