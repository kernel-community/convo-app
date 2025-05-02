// rsvp type to partstat (participation status, rfc 5545)

import { RSVP_TYPE } from "@prisma/client";

export const rsvpTypeToPartStat = (rsvpType: RSVP_TYPE) => {
  switch (rsvpType) {
    case RSVP_TYPE.GOING:
      return "ACCEPTED";
    case RSVP_TYPE.MAYBE:
      return "NEEDS-ACTION";
    case RSVP_TYPE.NOT_GOING:
      return "DECLINED";
    default:
      throw new Error(`invalid rsvp type: ${rsvpType}`);
  }
};
