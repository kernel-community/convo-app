import Hero from "../Hero";
import { SessionsWrapper } from "./RsvpSection";
import type { ClientEvent } from "src/types";
import SubmitRsvpSection from "./SubmitRsvpSection";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import EventDetails from "./EventDetails";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import type { ReactNode } from "react";
import { useState } from "react";
import ConfirmationModal from "src/components/ConfirmationModal";

const ModalContent = ({
  onClickConfirm,
  children,
}: {
  onClickConfirm?: () => void;
  children?: ReactNode;
}) => {
  // @todo @angelagilhotra add small form to get email
  // and name
  return (
    <div className="flex h-full flex-col justify-between">
      {children}
      {onClickConfirm && (
        <div>
          <button onClick={onClickConfirm}>Confirm</button>
        </div>
      )}
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

  const submitRsvp = async () => {
    await submit();
    openModal();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={
          <ModalContent>
            <div className="mt-4">
              <div>
                You are going to <span className="font-bold">{title}</span>
              </div>
              <div>
                {/* @todo @angelagilhotra add a small form to collect nickname (display nickname if already in the database) and email for calendar invite */}
                {/* send calendar invite from hello@kernel */}
              </div>
            </div>
          </ModalContent>
        }
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
