import { DateTime } from "luxon";
import type { ICalRequestParams } from "./generateiCalString";
import type { Event, Rsvp, User, EventProposer } from "@prisma/client";
import { RSVP_TYPE } from "@prisma/client";
import { sandwichDescriptionForCalendar } from "../sandwichDescriptionForCalendar";
import { EVENT_ORGANIZER_NAME, EVENT_ORGANIZER_EMAIL } from "../constants";

export type EventWithProposerAndRsvps = Event & {
  proposers: (EventProposer & { user: User })[];
  rsvps: (Rsvp & {
    attendee: User;
  })[];
};

export const generateiCalRequestFromEvent = ({
  event,
  recipientEmail,
  recipientName,
  rsvpType,
}: {
  event: EventWithProposerAndRsvps;
  recipientEmail: string;
  recipientName: string;
  rsvpType: RSVP_TYPE;
}): ICalRequestParams => {
  const sdt = DateTime.fromISO(event.startDateTime.toISOString(), {
    zone: "utc",
  });
  const edt = DateTime.fromISO(event.endDateTime.toISOString(), {
    zone: "utc",
  });
  if (
    !event.proposers ||
    event.proposers.length === 0 ||
    !event.proposers[0]?.user?.email
  ) {
    throw new Error(
      `Event ${event.id} must have at least one proposer with an email for iCal generation.`
    );
  }
  const firstProposer = event.proposers[0].user;

  // Generate a modified UID if this is a re-invitation after a 'not going' RSVP
  // This helps calendar clients recognize it as a new invitation
  const isReinvite = rsvpType === RSVP_TYPE.GOING && event.sequence > 1;
  const uid = isReinvite ? `${event.id}-reinvite-${event.sequence}` : event.id;

  return {
    start: `${sdt.toFormat("yyyyLLdd")}T${sdt.toFormat("HHmmss")}Z`,
    end: `${edt.toFormat("yyyyLLdd")}T${edt.toFormat("HHmmss")}Z`,
    organizer: {
      name: EVENT_ORGANIZER_NAME,
      email: EVENT_ORGANIZER_EMAIL,
    },
    uid: uid,
    title: event.title,
    description: event.descriptionHtml
      ? sandwichDescriptionForCalendar(
          event.descriptionHtml,
          event.hash,
          firstProposer.nickname,
          recipientEmail,
          recipientName
        )
      : "",
    location: event.location,
    // Increment sequence for NOT_GOING RSVPs to ensure calendar clients remove the event
    // This only affects the iCal attachment, not the database
    sequence:
      rsvpType === RSVP_TYPE.NOT_GOING ? event.sequence + 1 : event.sequence,
    recipient: {
      email: recipientEmail,
      rsvpType: event.isDeleted ? RSVP_TYPE.NOT_GOING : rsvpType,
    },
    rrule: event.rrule,
    status:
      event.isDeleted || rsvpType === RSVP_TYPE.NOT_GOING
        ? "CANCELLED"
        : "CONFIRMED",
    allOtherrecipients: event.rsvps
      .map((rsvp) => ({
        name: rsvp.attendee.nickname,
        email: rsvp.attendee.email || "",
      }))
      .filter((recipient) => recipient.email !== recipientEmail),
  };
};
