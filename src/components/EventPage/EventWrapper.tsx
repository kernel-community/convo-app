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
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "./RsvpConfirmationForm/TextField";
import Button from "../Button";
import Signature from "./Signature";

const ModalContainer = ({
  onClickConfirm,
  children,
}: {
  onClickConfirm?: () => void;
  children?: ReactNode;
}) => {
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

const rsvpInputSchema = z.object({
  email: z.string().optional(),
  nickname: z.string().optional(),
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

const ModalToConfirmRsvp = ({ title }: { title: string }) => {
  const { submit, updateUser, sendGCalInvite } = useSubmitRsvp();
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpInputSchema),
  });

  const onSubmit: SubmitHandler<RsvpInput> = async () => {
    submit();
    // if nickname is defined - then call updateUser
    if (getValues("nickname")) {
      setRsvpIntention({
        ...rsvpIntention,
        nickname: getValues("nickname"),
      });
      updateUser();
    }
    // if email is provided - send gcal invite
    if (getValues("email")) {
      setRsvpIntention({
        ...rsvpIntention,
        nickname: getValues("nickname"),
      });
      sendGCalInvite();
    }
  };
  return (
    <ModalContainer>
      <div className="mt-4">
        <div>
          Before confirming your spot in{" "}
          <span className="font-bold">{title}</span>
        </div>
        <div className="pt-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="align-center flex flex-col gap-6"
          >
            <TextField
              name="email"
              fieldName="Email"
              register={register}
              errors={errors}
              required={false}
            />
            {/* nickname */}
            {rsvpIntention.nickname ? (
              <Signature sign={rsvpIntention.nickname} />
            ) : (
              <TextField
                name="nickname"
                fieldName="Nickname"
                register={register}
                errors={errors}
                required={false}
              />
            )}

            <Button buttonText="Submit" type="submit" />
          </form>
        </div>
        <div>
          no email = no calendar invite ; event and your rsvp only visible on
          the app
        </div>
      </div>
    </ModalContainer>
  );
};

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

  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={<ModalToConfirmRsvp title={title} />}
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
