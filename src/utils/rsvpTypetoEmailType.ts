import { RSVP_TYPE } from "@prisma/client";
import type { EmailType } from "src/components/Email";

export const rsvpTypeToEmailType = (
  rsvpType: RSVP_TYPE,
  isUpdate = false
): EmailType => {
  switch (rsvpType) {
    case RSVP_TYPE.GOING:
      return isUpdate ? "update-attendee-going" : "invite-going";
    case RSVP_TYPE.MAYBE:
      return isUpdate ? "update-attendee-maybe" : "invite-maybe";
    case RSVP_TYPE.NOT_GOING:
      // There isn't a specific "update-attendee-not-going" template, so use invite-not-going for both
      return "invite-not-going";
    // We don't map OFF_WAITLIST here as it's set directly in the API route
    default:
      // Filter out reminder/waitlist types before throwing error
      if (
        rsvpType === RSVP_TYPE.OFF_WAITLIST ||
        rsvpType === RSVP_TYPE.REMINDER72HR ||
        rsvpType === RSVP_TYPE.REMINDER72HRPROPOSER
      ) {
        // Should not happen in normal flow from RSVP endpoint
        console.warn(
          `Unexpected RSVP type passed to rsvpTypeToEmailType: ${rsvpType}`
        );
        return "invite-going"; // Fallback gracefully
      }
      throw new Error(`Invalid RSVP type for email mapping: ${rsvpType}`);
  }
};
