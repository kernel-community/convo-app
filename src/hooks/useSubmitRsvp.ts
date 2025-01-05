import { useState } from "react";
import type { RsvpIntention } from "src/context/RsvpIntentionContext";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { useUser } from "src/context/UserContext";

const addRsvpToDb = async (rsvp: RsvpIntention, userId: string | undefined) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/create/rsvp", {
          body: JSON.stringify({
            rsvp: {
              userId,
              eventId: rsvp.eventId,
            },
          }),
          method: "POST",
          headers: { "Content-type": "application/json" },
        })
      ).json()
    ).data;
  } catch (err) {
    throw err;
  }
  return res;
};

const useSubmitRsvp = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { rsvpIntention: rsvp } = useRsvpIntention();
  const { fetchedUser: user } = useUser();

  // create rsvp in the database
  const submit = async () => {
    if ([rsvp.eventId].length === 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addRsvpToDb(rsvp, user.id);
    } catch (err) {
      setIsSubmitting(false);
      setIsError(true);
      throw err;
    }
  };
  return {
    submit,
    isSubmitting,
    isError,
    resetError: setIsError,
  };
};

export default useSubmitRsvp;
