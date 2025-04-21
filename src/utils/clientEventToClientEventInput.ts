/**
 * converts an object of type ClientEvent to ClientEventInput
 */

import type { ClientEvent, ClientEventInput } from "src/types";

const parse = (event: ClientEvent): ClientEventInput => {
  const {
    title,
    descriptionHtml,
    sessions,
    limit,
    location,
    hash,
    id,
    proposers,
  } = event;
  const parsedSessions: ClientEventInput["sessions"] = sessions.map(
    (session, key) => {
      const start = new Date(session.startDateTime);
      const end = new Date(session.endDateTime);
      return {
        dateTime: start,
        duration: Math.abs(end.getTime() - start.getTime()) / 36e5,
        count: key,
        id: session.id,
      };
    }
  );
  return {
    id,
    title,
    description: descriptionHtml || "",
    sessions: parsedSessions,
    limit: limit.toString(),
    location,
    proposers: proposers.map((p) => ({ userId: p.user.id })),
    hash,
    gCalEvent: true,
    // temp, fix this
    dateTimeStartAndEnd: {
      start: new Date(event.startDateTime),
      end: new Date(event.endDateTime),
    },
    recurrenceRule: event.rrule || "",
    type: event.type,
  };
};

export default parse;
