import TextField from "../RsvpConfirmationForm/TextField";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../Button";
import Signature from "../Signature";
import isNicknameSet from "src/utils/isNicknameSet";
import FieldLabel from "./FieldLabel";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import type { RsvpInput } from "../EventWrapper";
import { rsvpInputSchema } from "../EventWrapper";
import type { UserStatus } from "src/context/UserContext";
import type { User } from "@prisma/client";
import { AiOutlineEdit, AiOutlineCheck } from "react-icons/ai";
import { useState } from "react";

const ModalToConfirmRsvp = ({
  title,
  user,
  hideEmailRequest = true,
}: {
  title: string;
  user?: UserStatus;
  hideEmailRequest: boolean;
}) => {
  const { submit } = useSubmitRsvp();
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpInputSchema),
  });
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const onSubmit: SubmitHandler<RsvpInput> = async () => {
    try {
      await submit();
    } catch (err) {
      console.error("There was an error", JSON.stringify(err));
      setIsError(true);
      setIsSuccess(false);
      return;
    }
    setIsSuccess(true);
    setIsError(false);
  };

  if (isSuccess) {
    return (
      <div className="mt-4 flex h-full flex-col">
        <div className="flex flex-row items-center gap-2">
          RSVP Recorded <AiOutlineCheck />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 flex h-full flex-col">
        <div className="flex flex-row items-center gap-2">
          There was an Error :(
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex h-full flex-col">
      <div>
        Before confirming your spot in{" "}
        <span className="font-bold">{title}</span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="align-center flex h-full flex-col justify-between gap-6 pt-4"
      >
        {!hideEmailRequest && (
          <div>
            <FieldLabel>
              Would you like to receive a google Calendar invite?
            </FieldLabel>
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
            <FieldLabel>nickname</FieldLabel>
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
            />
          </div>
        )}
        <Button buttonText="Submit" type="submit" />
      </form>
    </div>
  );
};

export default ModalToConfirmRsvp;
