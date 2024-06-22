"use client";
import useEvent from "src/hooks/useEvent";
import { sortSessions } from "src/utils/dateTime";
import formatUserIdentity from "src/utils/formatUserIdentity";
import isNicknameSet from "src/utils/isNicknameSet";
export const RsvpCount = ({
  sessionId,
  summaryData,
  eventHash,
}: {
  sessionId: string;
  summaryData: JSX.Element;
  eventHash: string;
}) => {
  const { data } = useEvent({ hash: eventHash });
  const { sessions } = data;
  const { sessions: sortedSessions } = sortSessions(sessions);
  const session = sortedSessions.find((session) => session.id === sessionId);
  return (
    <details className="group">
      <summary className="cursor-pointer list-none font-medium">
        {summaryData}
      </summary>
      {session && session?.rsvpCount > 0 ? (
        <div className="group-open:animate-fadeIn mt-3 h-auto max-h-32 overflow-y-auto text-neutral-600">
          {session.rsvps.map((rsvp, key) => {
            if (isNicknameSet(rsvp.attendee.nickname)) {
              return (
                <div key={key}>
                  {formatUserIdentity(rsvp.attendee.nickname)}
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="group-open:animate-fadeIn mt-3 h-10 text-neutral-600">
          No RSVPs yet
        </div>
      )}
    </details>
  );
};
