import Button from "../Button";
import { useUser } from "src/context/UserContext";
import LoginButton from "../LoginButton";
import FieldLabel from "../StrongText";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { RsvpInput } from "./EventWrapper";
import { rsvpInputSchema } from "./EventWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import { useState } from "react";
import isNicknameSet from "src/utils/isNicknameSet";
import Signature from "./Signature";
import type { User } from "@prisma/client";
import { InfoBox } from "../InfoBox";

const SubmitRsvpSection = ({
  text,
  loading,
  disabled,
}: {
  text?: string;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const { isSignedIn } = user;
  const { handleSubmit } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpInputSchema),
  });
  const { submit, isError, resetError } = useSubmitRsvp();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLoading = loading || isSubmitting;

  const onSubmit: SubmitHandler<RsvpInput> = async () => {
    setIsSubmitting(true);
    try {
      await submit();
    } catch (err) {
      console.error("There was an error", JSON.stringify(err));
      setIsSuccess(false);
      setIsSubmitting(false);
      return;
    }
    setIsSuccess(true);
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
              {/* nickname */}
              {user && isNicknameSet(user.nickname) && (
                <div>
                  <FieldLabel>Signing as</FieldLabel>
                  <div className="flex flex-row gap-3">
                    <Signature user={user as User} style="handwritten" />
                  </div>
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
                  onClick={() => resetError(false)}
                >
                  {" "}
                  Try Again{" "}
                </span>
              </InfoBox>
            )}
            {isSuccess && (
              <InfoBox type="info">
                RSVP submitted successfully. You should receive a Google
                Calendar event invite soon.
              </InfoBox>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitRsvpSection;
