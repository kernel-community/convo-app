import { RSVP_TYPE } from "@prisma/client";
export const emailTypeToRsvpType = (type: string): RSVP_TYPE | null => {
  switch (type) {
    case "invite-going":
      return RSVP_TYPE.GOING;
    case "invite-maybe":
      return RSVP_TYPE.MAYBE;
    case "invite-not-going":
      return RSVP_TYPE.NOT_GOING;
    // Approval emails don't map to RSVP types - they're notifications only
    case "approval-requested":
    case "approval-approved":
    case "approval-rejected":
      return null; // Signal that no iCal should be generated
    default:
      return RSVP_TYPE.GOING;
  }
};
