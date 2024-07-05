"use client";
import { Copy } from "lucide-react";
import useEvent from "src/hooks/useEvent";
import { sortSessions } from "src/utils/dateTime";
import formatUserIdentity from "src/utils/formatUserIdentity";
import isNicknameSet from "src/utils/isNicknameSet";
import CopyButton from "../CopyButton";
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
      {session && session.rsvps.length > 0 && (
        <CopyButton
          text={session?.rsvps.map((rsvp) => rsvp.attendee.email).toString()}
          label="Copy all emails"
        />
      )}
      {session && session?.rsvpCount > 0 ? (
        <div className="group-open:animate-fadeIn mt-3 h-auto max-h-32 overflow-y-auto text-neutral-600">
          {session.rsvps.map((rsvp, key) => {
            if (isNicknameSet(rsvp.attendee.nickname)) {
              return (
                <div key={key} className="grid grid-cols-2">
                  <span>{formatUserIdentity(rsvp.attendee.nickname)}</span>
                  <span>{rsvp.attendee.email}</span>
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
