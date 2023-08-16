import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { useState } from "react";
import ConfirmationModal from "src/components/ConfirmationModal";
import { z } from "zod";
import { useUser } from "src/context/UserContext";
import ModalToConfirmRsvp from "./RsvpConfirmationForm/Modal";
import Button from "../Button";
import { useRouter } from "next/router";
import { getDateTimeString } from "src/utils/dateTime";
import type { Session as ClientSession } from "src/types";
import { EventDateTime, Seats } from "./Session";
import formatUserIdentity from "src/utils/formatUserIdentity";
import isNicknameSet from "src/utils/isNicknameSet";

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

// sessions wrapper component that doesnt
// allow RSVPing
// displayed when currently logged in user
// is the owner of the event
// accordian component
const SessionsDetailsNonSubmittable = ({
  sessions,
}: {
  sessions: Array<ClientSession>;
}) => {
  return (
    <div>
      <div className="mx-auto mt-8 grid max-w-xl divide-y divide-neutral-200">
        {sessions.map((session, key) => {
          let anonRsvpCount = 0;
          let nonAnonRsvpCount = 0;
          session.rsvps.map((rsvp) => {
            if (!isNicknameSet(rsvp.attendee.nickname)) {
              anonRsvpCount++;
            } else {
              nonAnonRsvpCount++;
            }
          });
          return (
            <div className="py-5" key={key}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
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
                </summary>
                {session.rsvpCount > 0 ? (
                  <div className="group-open:animate-fadeIn mt-3 h-32 overflow-y-auto text-neutral-600">
                    {session.rsvps.map((rsvp, key) => {
                      if (isNicknameSet(rsvp.attendee.nickname)) {
                        return (
                          <div key={key}>
                            {formatUserIdentity(
                              rsvp.attendee.nickname,
                              rsvp.attendee.address
                            )}
                          </div>
                        );
                      }
                    })}
                    <div>
                      {nonAnonRsvpCount ? "+ " : ""}
                      {anonRsvpCount}{" "}
                      {nonAnonRsvpCount
                        ? anonRsvpCount > 1
                          ? "others"
                          : "other"
                        : ""}{" "}
                      RSVPd anonymously
                    </div>
                  </div>
                ) : (
                  <div className="group-open:animate-fadeIn mt-3 h-10 text-neutral-600">
                    No RSVPs yet
                  </div>
                )}
              </details>
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
}: {
  event: ClientEvent;
  isEditable: boolean;
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
  } = event;

  const { rsvpIntention } = useRsvpIntention();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;
  const [openModalFlag, setOpenModalFlag] = useState(false);
  const closeModal = () => setOpenModalFlag(false);
  const { fetchedUser: user } = useUser();
  const hideEmailRequest = !(!!event.gCalEventId && !!event.gCalId);
  const router = useRouter();
  const navigateToEditPage = () => router.push(`/edit/${event.hash}`);
  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={
          <ModalToConfirmRsvp
            title={title}
            user={user}
            hideEmailRequest={hideEmailRequest}
          />
        }
        title="RSVP for Event"
      />
      <div className="flex flex-row items-center justify-between">
        <Hero title={title} isImported={isImported} isDeleted={isDeleted} />
        {isEditable && (
          <Button buttonText="Edit event" handleClick={navigateToEditPage} />
        )}
      </div>
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <EventDetails html={descriptionHtml} proposer={proposer} />
        <div className="min-w-100 flex flex-col gap-2">
          {isEditable && <SessionsDetailsNonSubmittable sessions={sessions} />}
          {!isEditable && <SessionsWrapper sessions={sessions} />}
          {!isEditable && (
            <SubmitRsvpSection
              text={
                totalUniqueRsvps > 5
                  ? `Join ${totalUniqueRsvps} others in attending the event`
                  : `Be amongst the first few to RSVP!`
              }
              disabled={isDisabled}
              event={event}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EventWrapper;
