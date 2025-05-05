import type { DateTime } from "luxon";
import { rsvpTypeToPartStat } from "../rsvpTypeToPartStat";
import type { RSVP_TYPE } from "@prisma/client";

export const getDateTime = (dt: DateTime) =>
  `${dt.toUTC().toFormat("yyyyLLdd")}T${dt.toUTC().toFormat("HHmmss")}Z`;

export const generateEventString = ({
  start,
  end,
  rrule,
  organizer,
  uid,
  recipient,
  title,
  description,
  location,
  sequence,
  status = "CONFIRMED",
  creationTimezone,
}: // allOtherrecipients,
ICalRequestParams) => {
  // For cancelled events, always set PARTSTAT to DECLINED
  const partstat =
    status === "CANCELLED"
      ? "DECLINED"
      : rsvpTypeToPartStat(recipient.rsvpType as RSVP_TYPE);

  // Add timezone information to the description if available
  let enhancedDescription = description;
  if (creationTimezone) {
    // Escape any newlines in the original description to maintain iCal format
    const escapedDescription = description.replace(/\n/g, "\\n");
    // Add the timezone info at the beginning with improved wording
    enhancedDescription = `[TIMEZONE NOTE: This event was originally created in the ${creationTimezone} timezone. Times shown in your calendar are automatically converted to your local time.]\\n\\n${escapedDescription}`;
  }

  const event =
    `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${start}` +
    `${rrule ? `\n${rrule}\n` : `\n`}` +
    `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}
UID:${uid}@evts.convo.cafe
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=${partstat};RSVP=TRUE;CN=${recipient.email};X-NUM-GUESTS=0:mailto:${recipient.email}
SUMMARY:${title}
DESCRIPTION:${enhancedDescription}
LOCATION:${location}
SEQUENCE:${sequence}
STATUS:${status}
END:VEVENT`;
  return event;
};

export type ICalRequestParams = {
  start: string;
  end: string;
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
  creationTimezone?: string | null;
};
export const generateiCalString = (
  events: Array<ICalRequestParams>,
  method: "REQUEST" | "CANCEL" = "REQUEST"
) => {
  // Allow method to be passed in, defaulting to REQUEST if not specified
  const iCal = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
NAME:convo-cafe
PRODID:-//convo.cafe//NONSGML convo.cafe//EN
X-WR-CALNAME:convo-cafe
METHOD:${method}
${events.map((evt) => generateEventString(evt)).join(`
`)}
END:VCALENDAR`;
  return iCal;
};
