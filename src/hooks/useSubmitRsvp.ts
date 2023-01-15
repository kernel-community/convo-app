// given a userId and eventIds array
// submit rsvp for the user for each event
// in the array

import { useState } from "react";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";

const useSubmitRsvp = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { rsvpIntention: rsvp } = useRsvpIntention();
  const submit = async () => {
    setIsSubmitting(true);
    if (rsvp.eventIds.length === 0) {
      console.log("no events selected to rsvp.");
      return;
    }
    let res;
    try {
      res = (
        await (
          await fetch("/api/create/rsvp", {
            body: JSON.stringify({
              rsvp: {
                address: rsvp.attendeeAddress,
                events: rsvp.eventIds,
              },
            }),
            method: "POST",
            headers: { "Content-type": "application/json" },
          })
        ).json()
      ).data;
    } catch (err) {
      setIsSubmitting(false);
      setIsError(true);
      throw err;
    }
    setIsSubmitting(false);
    return res;
  };
  return {
    submit,
    isSubmitting,
    isError,
  };
};

export default useSubmitRsvp;
