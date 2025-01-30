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
  const sdt = DateTime.fromISO(event.startDateTime.toISOString(), {
    zone: "utc",
  });
  const edt = DateTime.fromISO(event.endDateTime.toISOString(), {
    zone: "utc",
  });
  if (!event.proposer.email) {
    throw new Error(`Proposer: ${event.proposer.id} email is required`);
  }
  return {
    start: `${sdt.toFormat("yyyyLLdd")}T${sdt.toFormat("HHmmss")}Z`,
    end: `${edt.toFormat("yyyyLLdd")}T${edt.toFormat("HHmmss")}Z`,
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
