import type { User } from "@prisma/client";
import { useState } from "react";
import type { RsvpIntention } from "src/context/RsvpIntentionContext";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import useUser from "./useUser";

// updateNickname - /api/update/user
const updateUser = async (rsvp: RsvpIntention, address: string | undefined) => {
  if (!address || !rsvp.nickname) return; // nothing to update
  let res;
  const user: Partial<User> = {
    address,
    nickname: rsvp.nickname,
  };
  try {
    res = (
      await (
        await fetch("/api/update/user", {
          body: JSON.stringify({ user }),
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

// sendGCalInvite - /api/services/google
const sendGCalInvite = async (rsvp: RsvpIntention) => {
  console.log("send gcal invite here", rsvp);
};

const addRsvpToDb = async (rsvp: RsvpIntention) => {
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
    throw err;
  }
  return res;
};

const useSubmitRsvp = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { rsvpIntention: rsvp } = useRsvpIntention();
  const { user } = useUser();
  // create rsvp in the database
  const submit = async () => {
    if (rsvp.eventIds.length === 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      updateUser(rsvp, user?.address);
      sendGCalInvite(rsvp);
      return addRsvpToDb(rsvp);
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
  };
};

export default useSubmitRsvp;
