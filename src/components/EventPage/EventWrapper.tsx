import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";

const EventWrapper = ({ event }: { event: ClientEvent }) => {
  const { submit, isSubmitting } = useSubmitRsvp();
  const { proposer, totalUniqueRsvps, descriptionHtml, sessions, type, title } =
    event;
  const { rsvpIntention } = useRsvpIntention();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;
  return (
    <>
      <Hero title={title} type={type} proposer={proposer.name} />
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <EventDetails html={descriptionHtml} proposer={proposer.name} />
        <div>
          <div className="flex flex-col gap-2">
            <SessionsWrapper sessions={sessions} />
            <SubmitRsvpSection
              text={
                totalUniqueRsvps > 5
                  ? `Join ${totalUniqueRsvps} others in attending the event`
                  : `Be amongst the first few to RSVP!`
              }
              handleSubmit={submit}
              loading={isSubmitting}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventWrapper;
