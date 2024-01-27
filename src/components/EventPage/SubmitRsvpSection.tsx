import { useUser } from "src/context/UserContext";
import LoginButton from "../LoginButton";
import FieldLabel from "../StrongText";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { RsvpInput } from "./EventWrapper";
import { rsvpInputSchema } from "./EventWrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import { useEffect, useState } from "react";
import isNicknameSet from "src/utils/isNicknameSet";
import Signature from "./Signature";
import type { User } from "@prisma/client";
import { Button } from "../ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "../ui/credenza";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import useEventsFromId from "src/hooks/useEventsFromId";
import { getDateTimeString } from "src/utils/dateTime";

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
  const { submit } = useSubmitRsvp();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLoading = loading || isSubmitting;
  const [openModalFlag, setOpenModalFlag] = useState(false);

  const submitRSVP = async () => {
    setIsSubmitting(true);
    try {
      await submit();
    } catch (err) {
      console.error("There was an error", JSON.stringify(err));
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    setOpenModalFlag(false);
  };
  const { rsvpIntention: rsvp } = useRsvpIntention();
  const {
    isLoading: eventsToSubmitRsvpToLoading,
    data: eventsToSubmitRsvpTo,
    refetch: refetchEventsToSubmit,
  } = useEventsFromId({
    ids: rsvp.eventIds,
  });

  useEffect(() => {
    if (rsvp.eventIds.length > 0) {
      refetchEventsToSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsvp.eventIds, eventsToSubmitRsvpTo]);

  const onSubmit: SubmitHandler<RsvpInput> = async () => setOpenModalFlag(true);

  return (
    <>
      <Credenza open={openModalFlag} onOpenChange={setOpenModalFlag}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Confirm RSVP for Convo</CredenzaTitle>
            <CredenzaDescription>
              Click confirm to add your RSVP to the selected Convo. You will
              shortly receive a google calendar invite associated with the
              event.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <div>
              You will be invited for the following convos (includes the Convos
              you have previously signed up for):
              <div></div>
              <div className="pt-2">
                {rsvp.eventIds.length > 0 &&
                  eventsToSubmitRsvpTo &&
                  eventsToSubmitRsvpTo.sessions.length > 0 &&
                  eventsToSubmitRsvpTo.sessions.map((e, ek) => {
                    return (
                      <div key={ek}>
                        {getDateTimeString(
                          new Date(e.startDateTime).toISOString(),
                          "date"
                        )}
                        ,{" "}
                        {getDateTimeString(
                          new Date(e.startDateTime).toISOString(),
                          "time"
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <div className="flex w-full flex-col gap-1">
              <Button
                onClick={() => submitRSVP()}
                className="w-full"
                isLoading={
                  isLoading || isSubmitting || eventsToSubmitRsvpToLoading
                }
              >
                Confirm
              </Button>
            </div>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
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
                  className="mt-3 w-full"
                >
                  RSVP
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SubmitRsvpSection;
