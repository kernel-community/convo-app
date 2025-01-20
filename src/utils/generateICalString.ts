import type { DateTime } from "luxon";

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
  allOtherrecipients,
}: ICalRequestParams) => {
  const event =
    `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${start}` +
    `${rrule ? `\n${rrule}\n` : `\n`}` +
    `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}
UID:${uid}@evts.convo.cafe
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${
      recipient.email
    };X-NUM-GUESTS=0:mailto:${recipient.email}
    ${allOtherrecipients
      .map(
        (recipient: { name: string; email: string }) =>
          `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${recipient.name};X-NUM-GUESTS=0:mailto:${recipient.email}`
      )
      .join("\n")}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
SEQUENCE:${sequence}
STATUS:CONFIRMED
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
  };
  uid: string;
  title: string;
  description: string;
  location: string;
  sequence: number;
  rrule?: string | null;
  allOtherrecipients: Array<{ name: string; email: string }>;
};
// works for google/gmail
export const generateICalRequest = (events: Array<ICalRequestParams>) => {
  const iCal = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
NAME:convo-cafe
X-WR-CALNAME:convo-cafe
METHOD:REQUEST
${events.map((evt) => generateEventString(evt)).join(`\n`)}
END:VCALENDAR`;
  return iCal;
};
