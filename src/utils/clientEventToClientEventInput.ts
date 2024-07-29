/**
 * converts an object of type ClientEvent to ClientEventInput
 */

import type { ClientEvent, ClientEventInput } from "src/types";

const parse = (event: ClientEvent): ClientEventInput => {
  const { title, descriptionHtml, sessions, limit, location, nickname, hash } =
    event;
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
    title,
    description: descriptionHtml || "",
    sessions: parsedSessions,
    limit: limit.toString(),
    location,
    nickname,
    hash,
    gCalEvent: true,
    // temp, fix this
    dateTimeStartAndEnd: {
      start: new Date(),
      end: new Date(),
    },
  };
};

export default parse;
