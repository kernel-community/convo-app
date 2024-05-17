import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { z } from "zod";
import { Button } from "../ui/button";
import { getDateTimeString, sortSessions } from "src/utils/dateTime";
import type { Session as ClientSession } from "src/types";
import { EventDateTime, Seats } from "./Session";
import formatUserIdentity from "src/utils/formatUserIdentity";
import isNicknameSet from "src/utils/isNicknameSet";
import Link from "next/link";
import useUserRsvpForConvo from "src/hooks/useUserRsvpForConvo";
import useEvent from "src/hooks/useEvent";
import { useRouter } from "next/navigation";

const TransitioningArrow = () => {
  return (
    <span className="transition group-open:rotate-180">
      <svg
        fill="none"
        height="24"
        shape-rendering="geometricPrecision"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        width="24"
      >
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    </span>
  );
};

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

// sessions wrapper component that doesnt
// allow RSVPing
// displayed when currently logged in user
// is the owner of the event
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

export const rsvpInputSchema = z.object({
  email: z.string().optional(),
  nickname: z.string().optional(),
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

const EventWrapper = ({
  event,
  isEditable,
  hostname,
  eventHash,
}: {
  event: ClientEvent;
  isEditable: boolean;
  hostname: string;
  eventHash: string;
}) => {
  const {
    totalUniqueRsvps,
    descriptionHtml,
    sessions,
    title,
    proposer,
    // @todo handle deleted event display
    isDeleted,
    isImported,
    collections,
    createdAt,
  } = event;
  const { rsvpIntention } = useRsvpIntention();
  const { rsvps } = useUserRsvpForConvo({ hash: event.hash });
  const { push } = useRouter();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;
  const navigateToEditPage = () => push(`/edit/${event.hash}`);
  const isPartOfCollection = collections.length > 0;
  const collectionHrefs = collections.map((c, k) => (
    <Link key={k} href={`/collection/${c.id}`}>
      {" "}
      <span className="text-kernel-light underline decoration-dotted">
        {c.name}
      </span>
      {k + 1 !== collections.length ? "," : ""}
    </Link>
  ));
  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <Hero title={title} isImported={isImported} isDeleted={isDeleted} />
        {isEditable && !event.isDeleted && (
          <Button onClick={navigateToEditPage}>Edit Event</Button>
        )}
      </div>
      {isPartOfCollection && (
        <div className="font-primary">
          {`This event is part of ${
            collections.length > 1 ? "" : "the "
          } collection${collections.length > 1 ? "s" : ""}:`}
          {collectionHrefs}
        </div>
      )}
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <EventDetails html={descriptionHtml} proposer={proposer} />
        <div className="min-w-100 flex flex-col gap-2">
          {isEditable && (
            <SessionsDetailsNonSubmittable
              sessions={sessions}
              eventHash={eventHash}
            />
          )}
          {!isEditable && (
            <SessionsWrapper sessions={sessions} hostname={hostname} />
          )}
          {!isEditable && (
            <SubmitRsvpSection
              text={
                totalUniqueRsvps > 5
                  ? `Join ${totalUniqueRsvps} others in attending the event`
                  : `Be amongst the first few to RSVP!`
              }
              disabled={isDisabled}
              buttonText={rsvps && rsvps.length > 0 ? "Update RSVP" : "RSVP"}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EventWrapper;
