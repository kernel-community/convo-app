"use client";
import Hero from "../Hero";
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
import { EventCard, EventsView } from "../ui/event-list";
import { useEffect, useState } from "react";

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
    title,
    proposer,
    // @todo handle deleted event display
    isDeleted,
    isImported,
    collections,
    recurrenceRule,
    startDateTime,
  } = event;

  const { rsvpIntention } = useRsvpIntention();
  const { rsvps } = useUserRsvpForConvo({ hash: event.hash });
  const router = useRouter();
  const { eventId } = rsvpIntention;
  const {
    fetchedUser: { isSignedIn },
  } = useUser();
  const isDisabled = [eventId].length === 0;
  const navigateToEditPage = () => router.push(`/edit/${event.hash}`);
  const isPartOfCollection = collections.length > 0;
  const [isNavigating, setIsNavigating] = useState(false);
  const collectionHrefs = collections.map((c, k) => (
    <Link key={k} href={`/collection/${c.id}`}>
      {" "}
      <span className="text-kernel-light underline decoration-dotted">
        {c.name}
      </span>
      {k + 1 !== collections.length ? "," : ""}
    </Link>
  ));

  const handleInfoClick = async () => {
    try {
      setIsNavigating(true);
      await router.push(`/rsvp/${eventHash}?info=true`);
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    // Prefetch the info page
    router.prefetch(`/rsvp/${eventHash}?info=true`);
  }, [eventHash, router]);

  return (
    <>
      <div className="flex flex-row items-center">
        <Hero title={title} isImported={isImported} isDeleted={isDeleted} />
      </div>
      <div className="flex flex-row items-center gap-3">
        <div
          className={`cursor-pointer underline decoration-dotted`}
          onClick={handleInfoClick}
        >
          {isNavigating ? "Loading..." : "info"}
        </div>
        {isEditable && !event.isDeleted && (
          <div
            className={`cursor-pointer underline decoration-dotted ${
              isNavigating ? "opacity-20" : ""
            }`}
            onClick={navigateToEditPage}
          >
            {isNavigating ? "Loading..." : "edit"}
          </div>
        )}
        <div
          className="cursor-pointer underline decoration-dotted"
          onClick={() => {
            console.log("share");
            // open modal - credenza
          }}
        >
          share
        </div>
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
          {recurrenceRule ? (
            <EventsView
              rruleStr={recurrenceRule}
              startDateTime={startDateTime}
            />
          ) : (
            <EventCard date={new Date(startDateTime)} />
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
