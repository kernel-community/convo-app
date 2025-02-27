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
}: // allOtherrecipients,
ICalRequestParams) => {
  // For cancelled events, always set PARTSTAT to DECLINED
  const partstat =
    status === "CANCELLED"
      ? "DECLINED"
      : rsvpTypeToPartStat(recipient.rsvpType as RSVP_TYPE);

  const event =
    `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${start}` +
    `${rrule ? `\n${rrule}\n` : `\n`}` +
    `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}
UID:${uid}@evts.convo.cafe
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=${partstat};CN=${recipient.email};X-NUM-GUESTS=0:mailto:${recipient.email}
SUMMARY:${title}
DESCRIPTION:${description}
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
};
export const generateiCalString = (events: Array<ICalRequestParams>) => {
  // Use REQUEST as default method, individual event statuses will handle cancellations
  const iCal = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
NAME:convo-cafe
PRODID:-//convo.cafe//NONSGML convo.cafe//EN
X-WR-CALNAME:convo-cafe
METHOD:REQUEST
${events.map((evt) => generateEventString(evt)).join(`\n`)}
END:VCALENDAR`;
  return iCal;
};
