// sessions wrapper component that doesnt
// allow RSVPing
// displayed when currently logged in user
// is the owner of the event

import { getDateTimeString, sortSessions } from "src/utils/dateTime";
import { TransitioningArrow } from "../TransitioningArrow";
import { EventDateTime, Seats } from "./Session";
import { RsvpCount } from "./RsvpCount";
import type { Session as ClientSession } from "src/types";

// accordian component
export const SessionsDetailsNonSubmittable = ({
  sessions,
  eventHash,
}: {
  sessions: Array<ClientSession>;
  eventHash: string;
}) => {
  const { sessions: sortedSessions } = sortSessions(sessions);
  return (
    <div>
      <div className="mx-auto mt-8 grid max-w-xl gap-4 divide-y divide-neutral-200">
        <div>Expand to See RSVPs/Signups</div>
        {sortedSessions.map((session, key) => {
          return (
            <div className="py-5" key={key}>
              <RsvpCount
                eventHash={eventHash}
                sessionId={session.id}
                summaryData={
                  <span className="flex items-center justify-between">
                    <EventDateTime
                      date={getDateTimeString(session.startDateTime, "date")}
                      time={getDateTimeString(session.startDateTime, "time")}
                    />
                    <Seats
                      availableSeats={session.availableSeats}
                      totalSeats={session.limit}
                      noLimit={session.noLimit}
                    />
                    <TransitioningArrow />
                  </span>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
