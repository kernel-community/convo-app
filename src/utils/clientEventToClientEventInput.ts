/**
 * converts an object of type ClientEvent to ClientEventInput
 */

import { ClientEventInput } from "src/components/ProposeForm";
import { ClientEvent } from "src/types";

const parse = (event: ClientEvent): ClientEventInput => {
  const {
    title,
    descriptionHtml,
    sessions,
    limit,
    location,
    nickname,
    gCalEventRequested,
    hash,
  } = event;
  const parsedSessions: ClientEventInput["sessions"] = sessions.map(
    (session, key) => {
      return {
        dateTime: new Date(session.startDateTime),
        duration: 1,
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
    gCalEvent: gCalEventRequested,
    hash,
  };
};

export default parse;
