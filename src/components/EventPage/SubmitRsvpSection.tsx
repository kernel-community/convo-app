import Button from "../Button";
import { useUser } from "src/context/UserContext";
import LoginButton from "../LoginButton";
import FieldLabel from "../StrongText";
import TextField from "./RsvpConfirmationForm/TextField";
import type { ClientEvent } from "src/types";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { RsvpInput } from "./EventWrapper";
import { rsvpInputSchema } from "./EventWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import { useState } from "react";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import isNicknameSet from "src/utils/isNicknameSet";
import Signature from "./Signature";
import type { User } from "@prisma/client";
import { AiOutlineEdit } from "react-icons/ai";
import { InfoBox } from "../InfoBox";

const SubmitRsvpSection = ({
  text,
  loading,
  disabled,
  event,
}: {
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  event: ClientEvent;
}) => {
  const { fetchedUser: user } = useUser();
  const { isSignedIn } = user;
  const hideEmailRequest = !(!!event.gCalEventId && !!event.gCalId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpInputSchema),
  });
  const { submit } = useSubmitRsvp();
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();

  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);

  const isLoading = loading || isSubmitting;
  const isDisabled = disabled || isLoading;

  const onSubmit: SubmitHandler<RsvpInput> = async () => {
    setIsSubmitting(true);
    try {
      await submit();
    } catch (err) {
      console.error("There was an error", JSON.stringify(err));
      setIsError(true);
      setIsSuccess(false);
      setIsSubmitting(false);
      return;
    }
    setIsSuccess(true);
    setIsError(false);
    setIsSubmitting(false);
  };
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2">
        <span className="font-primary text-sm font-light lowercase italic">
          {text}
        </span>
        {!isSignedIn ? (
          <LoginButton />
        ) : (
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="align-center flex h-full flex-col justify-between gap-6 pt-4"
            >
              {!hideEmailRequest && (
                <div>
                  <FieldLabel styles="text-sm">email</FieldLabel>
                  <TextField
                    hideLabel
                    name="email"
                    fieldName="Email"
                    register={register}
                    errors={errors}
                    required={false}
                    onChange={(e) => {
                      setRsvpIntention({
                        ...rsvpIntention,
                        email: e.target.value,
                      });
                    }}
                    disabled={isDisabled}
                  />
                </div>
              )}
              {/* nickname */}
              {user && isNicknameSet(user.nickname) && !isEditingNickname ? (
                <div>
                  <FieldLabel>Signing as</FieldLabel>
                  <div className="flex flex-row gap-3">
                    <Signature user={user as User} style="handwritten" />
                    <button
                      className="text-2xl"
                      type="button"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      <AiOutlineEdit />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <FieldLabel styles="text-sm">nickname</FieldLabel>
                  <TextField
                    hideLabel
                    name="nickname"
                    fieldName="Nickname"
                    register={register}
                    errors={errors}
                    required={false}
                    onChange={(e) => {
                      setRsvpIntention({
                        ...rsvpIntention,
                        nickname: e.target.value,
                      });
                    }}
                    disabled={isDisabled}
                  />
                </div>
              )}
              <Button
                type="submit"
                disabled={disabled}
                displayLoading={isLoading}
                buttonText={`RSVP`}
                className="mt-3 w-full"
              />
            </form>
            {isError && (
              <InfoBox type="error">
                There was an error.{" "}
                <span
                  className="cursor-pointer underline"
                  onClick={() => setIsError(false)}
                >
                  {" "}
                  Try Again{" "}
                </span>
              </InfoBox>
            )}
            {isSuccess && (
              <InfoBox type="info">RSVP submitted successfully</InfoBox>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitRsvpSection;
