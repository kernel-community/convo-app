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
  const { rsvp } = useUserRsvpForConvo({ hash: event.hash });
  const router = useRouter();
  const { eventId } = rsvpIntention;
  const {
    fetchedUser: { isSignedIn },
  } = useUser();
  const isDisabled = [eventId].length === 0;
  const navigateToEditPage = () => router.push(`/edit/${event.hash}`);
  const [isNavigating, setIsNavigating] = useState(false);

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
      <div className="container">
        <div className="flex flex-row items-center">
          <Hero isImported={isImported} isDeleted={isDeleted} event={event} />
        </div>
        <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <EventDetails html={descriptionHtml} proposer={proposer} />
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
