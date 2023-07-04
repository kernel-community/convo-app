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
  const { totalUniqueRsvps, descriptionHtml, sessions, title, proposer } =
    event;
  const { rsvpIntention } = useRsvpIntention();
  const { eventIds } = rsvpIntention;
  const isDisabled = eventIds.length === 0;
  const [openModalFlag, setOpenModalFlag] = useState(false);
  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);
  const onClickRsvp = () => openModal();
  // @help when I try calling this hook
  // in <ModalToConfirmRsvp /> above the user is
  // returned as undefined (???)
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
        <Hero title={title} />
        {isEditable && (
          <Button buttonText="Edit event" handleClick={navigateToEditPage} />
        )}
      </div>
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <EventDetails html={descriptionHtml} proposer={proposer} />
        <div className="min-w-100 flex flex-col gap-2">
          {!isEditable && (
            <>
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
            </>
          )}
          {/*
           * @todo @angelagilhotra
           * display all events
           * + number of RSVPs for each
           * + an option to send an email to all RSVPs (only if gCal exists)
           */}
        </div>
      </div>
    </>
  );
};

export default EventWrapper;
