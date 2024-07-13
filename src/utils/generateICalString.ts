import type { DateTime } from "luxon";

export const getDateTime = (dt: DateTime) =>
  `${dt.toUTC().toFormat("yyyyLLdd")}T${dt.toUTC().toFormat("HHmmss")}Z`;

// works for google/gmail
export const generateICalRequest = ({
  start,
  end,
  organizer,
  uid,
  title,
  description,
  location,
  sequence,
  recipient,
  rrule,
}: {
  start: string;
  end: string;
  organizer: {
    name: string;
    email: string;
  };
  recipient: {
    email: string;
  };
  uid: string;
  title: string;
  description: string;
  location: string;
  sequence: number;
  rrule?: string | null;
}) => {
  const iCal =
    `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${start}` +
    `${rrule ? `\n${rrule}\n` : `\n`}` +
    `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}
UID:${uid}@evts.convo.cafe
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${recipient.email};X-NUM-GUESTS=0:mailto:${recipient.email}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
SEQUENCE:${sequence}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  return iCal;
};
