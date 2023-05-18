import { useState } from "react";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";

const useSubmitRsvp = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { rsvpIntention: rsvp } = useRsvpIntention();

  // updateNickname - /api/update/user
  const updateUser = async () => {
    console.log("update user here");
    console.log(rsvp);
  };

  // sendGCalInvite - /api/services/google
  const sendGCalInvite = async () => {
    console.log("send gcal invite here");
    console.log(rsvp);
  };

  // create rsvp in the database
  const submit = async () => {
    setIsSubmitting(true);
    if (rsvp.eventIds.length === 0) {
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
    updateUser,
    sendGCalInvite,
    isSubmitting,
    isError,
  };
};

export default useSubmitRsvp;
