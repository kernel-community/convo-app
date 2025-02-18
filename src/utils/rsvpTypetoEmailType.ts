import { RSVP_TYPE } from "@prisma/client";

export const rsvpTypeToEmailType = (rsvpType: RSVP_TYPE) => {
  switch (rsvpType) {
    case RSVP_TYPE.GOING:
      return "invite-going";
    case RSVP_TYPE.MAYBE:
      return "invite-maybe";
    case RSVP_TYPE.NOT_GOING:
      return "invite-not-going";
    default:
      throw new Error(`invalid rsvp type: ${rsvpType}`);
  }
};
