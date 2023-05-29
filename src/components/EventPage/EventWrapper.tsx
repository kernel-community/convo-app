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

export const rsvpInputSchema = z.object({
  email: z.string().optional(),
  nickname: z.string().optional(),
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

const EventWrapper = ({ event }: { event: ClientEvent }) => {
  const { totalUniqueRsvps, descriptionHtml, sessions, type, title, nickname } =
    event;
  const { rsvpIntention } = useRsvpIntention();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;

  const [openModalFlag, setOpenModalFlag] = useState(false);

  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);

  const onClickRsvp = async () => {
    openModal();
  };

  // @help when I try calling this hook
  // in <ModalToConfirmRsvp /> above the user is
  // returned as undefined (???)
  const { fetchedUser: user } = useUser();

  const hideEmailRequest = !(!!event.gCalEventId && !!event.gCalId);

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
              handleSubmit={onClickRsvp}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventWrapper;
