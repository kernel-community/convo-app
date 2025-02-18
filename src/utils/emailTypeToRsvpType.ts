import { RSVP_TYPE } from "@prisma/client";
export const emailTypeToRsvpType = (type: string) => {
  switch (type) {
    case "invite-going":
      return RSVP_TYPE.GOING;
    case "invite-maybe":
      return RSVP_TYPE.MAYBE;
    case "invite-not-going":
      return RSVP_TYPE.NOT_GOING;
    default:
      return RSVP_TYPE.GOING;
  }
};
