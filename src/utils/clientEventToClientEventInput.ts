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
  } = event;
  const parsedSessions: ClientEventInput["sessions"] = sessions.map(
    (session, key) => {
      return {
        dateTime: new Date(session.startDateTime),
        duration: 1,
        count: key,
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
  };
};

export default parse;
