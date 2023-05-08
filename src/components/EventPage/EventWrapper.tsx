import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { useState } from "react";
import ConfirmationModal from "src/components/ConfirmationModal";

const ModalContent = ({
  title,
  onClickConfirm,
}: {
  title: string;
  onClickConfirm: () => void;
}) => {
  // @todo @angelagilhotra add small form to get email
  // and name
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p>You are confirmed for {title}</p>
      </div>
      <div>
        <button onClick={onClickConfirm}>Confirm</button>
      </div>
    </div>
  );
};

const EventWrapper = ({ event }: { event: ClientEvent }) => {
  const { submit, isSubmitting } = useSubmitRsvp();
  const { totalUniqueRsvps, descriptionHtml, sessions, type, title, nickname } =
    event;
  const { rsvpIntention } = useRsvpIntention();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;

  const [openModalFlag, setOpenModalFlag] = useState(false);

  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);

  const submitRsvp = () => {
    openModal();
    // submit();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={<ModalContent title={event.title} onClickConfirm={submit} />}
        title="RSVP for Event"
      />
      <Hero title={title} type={type} proposer={nickname} />
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <EventDetails html={descriptionHtml} proposer={nickname} />
        <div>
          <div className="flex flex-col gap-2">
            <SessionsWrapper sessions={sessions} />
            <SubmitRsvpSection
              text={
                totalUniqueRsvps > 5
                  ? `Join ${totalUniqueRsvps} others in attending the event`
                  : `Be amongst the first few to RSVP!`
              }
              handleSubmit={submitRsvp}
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
