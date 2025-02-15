import { DateTime } from "luxon";
import { rsvpTypeToPartStat } from "../rsvpTypeToPartStat";
import type { RSVP_TYPE } from "@prisma/client";

// Convert local time to UTC
const tzAbbreviationToIANA: Record<string, string> = {
  MST: "America/Denver",
  PST: "America/Los_Angeles",
  EST: "America/New_York",
  CST: "America/Chicago",
};

const toUTC = (dt: string, timezone: string): string => {
  // Convert abbreviated timezones to IANA names
  const ianaTimezone = tzAbbreviationToIANA[timezone] || timezone;
  const localDt = DateTime.fromFormat(dt, "yyyyMMdd'T'HHmmss", {
    zone: ianaTimezone,
  });
  if (!localDt.isValid) {
    throw new Error(`Invalid datetime or timezone: ${dt} ${timezone}`);
  }
  return localDt.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
};

export const generateEventString = ({
  start,
  end,
  timezone,
  rrule,
  organizer,
  uid,
  recipient,
  title,
  description,
  location,
  sequence,
  status = "CONFIRMED",
}: ICalRequestParams) => {
  // For cancelled events, always set PARTSTAT to DECLINED
  const partstat =
    status === "CANCELLED"
      ? "DECLINED"
      : rsvpTypeToPartStat(recipient.rsvpType as RSVP_TYPE);

  // DTSTAMP should always be in UTC
  const timestamp = DateTime.utc().toFormat("yyyyMMdd'T'HHmmss'Z'");

  const components = [
    "BEGIN:VEVENT",
    `DTSTART:${toUTC(start, timezone)}`,
    `DTEND:${toUTC(end, timezone)}`,
    `DTSTAMP:${timestamp}`,
    rrule,
    `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}`,
    `UID:${uid}@evts.convo.cafe`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=${partstat};CN=${recipient.email};X-NUM-GUESTS=0:mailto:${recipient.email}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `SEQUENCE:${sequence}`,
    `STATUS:${status}`,
    "END:VEVENT",
  ].filter(Boolean);

  return components.join("\r\n");
};

export type ICalRequestParams = {
  start: string;
  end: string;
  timezone: string;
  organizer: {
    name: string;
    email: string;
  };
  recipient: {
    email: string;
    rsvpType: string;
  };
  uid: string;
  title: string;
  description: string;
  location: string;
  sequence: number;
  rrule?: string | null;
  allOtherrecipients: Array<{ name: string; email: string }>;
  status: "TENTATIVE" | "CONFIRMED" | "CANCELLED";
};

export const generateiCalString = (events: Array<ICalRequestParams>) => {
  const components = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//convo.cafe//NONSGML v1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    ...events.map((evt) => generateEventString(evt)),
    "END:VCALENDAR",
  ];

  return components.join("\r\n") + "\r\n";
};
