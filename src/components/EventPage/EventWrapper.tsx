"use client";
import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { z } from "zod";
import { Button } from "../ui/button";
import Link from "next/link";
import useUserRsvpForConvo from "src/hooks/useUserRsvpForConvo";
import useEvent from "src/hooks/useEvent";
import { useRouter } from "next/navigation";
import { useUser } from "src/context/UserContext";
import { SessionsDetailsNonSubmittable } from "./SessionsDetailsNonSubmittable";
import { DEFAULT_PROFILE_IMAGE } from "src/utils/constants";

export const rsvpInputSchema = z.object({
  email: z.string().optional(),
  nickname: z.string().optional(),
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

const EventWrapper = ({
  event,
  isEditable,
  // hostname,
  eventHash,
}: {
  event: ClientEvent;
  isEditable: boolean;
  // hostname: string;
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
            <SessionsWrapper
              sessions={sessions}
              // hostname={hostname}
            />
          )}
          <div>
            <div className="flex -space-x-4 rtl:space-x-reverse">
              {/* <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="https://maroon-unsightly-clam-495.mypinata.cloud/ipfs/QmV8owGUxkytNkTuFTc8CawFvgxXhPKgrpvVwR4rmMPsnb" alt="" /> */}
              {event.uniqueRsvps.slice(0, 3).map((rsvp, key) => {
                const photo =
                  rsvp.attendee?.profile?.photo || DEFAULT_PROFILE_IMAGE;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                    src={photo}
                    alt=""
                    key={key}
                  />
                );
              })}
              {event.uniqueRsvps.length - 3 > 0 && (
                <a
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800"
                  href="#"
                >
                  +{event.uniqueRsvps.length - 3}
                </a>
              )}
            </div>
          </div>
          {!isEditable && (
            <SubmitRsvpSection
              // text={
              //   totalUniqueRsvps > 5
              //     ? `Join ${totalUniqueRsvps} others in attending the event`
              //     : `Be amongst the first few to RSVP!`
              // }
              disabled={isDisabled}
              buttonText={rsvps && rsvps.length > 0 ? "Update RSVP" : "RSVP"}
            />
          )}
        </div>
      </div>
    </>
  );
};

const EventWrapperWrapper = ({ eventHash }: { eventHash: string }) => {
  const { fetchedUser: user } = useUser();
  const {
    isLoading,
    isError,
    data: fetchedEventData,
  } = useEvent({ hash: eventHash });

  const isEditable =
    user && fetchedEventData ? user.id === fetchedEventData.proposerId : false;

  return (
    <>
      {!isLoading && !isError && fetchedEventData && (
        <EventWrapper
          event={fetchedEventData}
          isEditable={isEditable}
          // hostname={hostname}
          eventHash={eventHash}
        />
      )}
    </>
  );
};

export default EventWrapperWrapper;
