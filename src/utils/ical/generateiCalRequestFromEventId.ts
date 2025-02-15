import { DateTime } from "luxon";
import type { ICalRequestParams } from "./generateiCalString";
import type { Event, Rsvp, User } from "@prisma/client";
import { RSVP_TYPE } from "@prisma/client";
import { sandwichDescriptionForCalendar } from "../sandwichDescriptionForCalendar";

export type EventWithProposerAndRsvps = Event & {
  proposer: User;
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
  // For debugging
  console.log("Event timezone:", event.timezone);

  // If no timezone is specified, use UTC
  const timezone = event.timezone || "UTC";

  // For debugging
  console.log("Using timezone:", timezone);

  // Convert dates to the specified timezone
  const sdt = DateTime.fromJSDate(event.startDateTime, {
    zone: timezone,
  });
  const edt = DateTime.fromJSDate(event.endDateTime, {
    zone: timezone,
  });

  // For debugging
  console.log("Converted start date:", sdt.toISO());
  if (!event.proposer.email) {
    throw new Error(`Proposer: ${event.proposer.id} email is required`);
  }
  return {
    start: `${sdt.toFormat("yyyyLLdd")}T${sdt.toFormat("HHmmss")}`,
    end: `${edt.toFormat("yyyyLLdd")}T${edt.toFormat("HHmmss")}`,
    timezone: timezone, // Use the normalized timezone
    organizer: {
      name: event.proposer.nickname,
      email: event.proposer.email,
    },
    uid: event.id,
    title: event.title,
    description: event.descriptionHtml
      ? sandwichDescriptionForCalendar(
          event.descriptionHtml,
          event.hash,
          event.proposer.nickname,
          recipientEmail,
          recipientName
        )
      : "",
    location: event.location,
    sequence: event.sequence,
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
