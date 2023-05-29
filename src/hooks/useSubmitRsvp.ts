import type { User } from "@prisma/client";
import { useState } from "react";
import type { RsvpIntention } from "src/context/RsvpIntentionContext";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import { useUser } from "src/context/UserContext";

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
              // add email to emails[] array in Event table
              email: rsvp.email,
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

const sendGCalInvite = async (rsvp: RsvpIntention) => {
  if (!rsvp.email || !rsvp.eventIds) {
    throw new Error("incorrect params");
  }
  let res;
  try {
    res = (
      await (
        await fetch("/api/actions/google/sendInvite", {
          body: JSON.stringify({
            events: rsvp.eventIds,
            email: rsvp.email,
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
    if (rsvp.eventIds.length === 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUser(rsvp, user?.address);
      await addRsvpToDb(rsvp);
      if (rsvp.email) {
        // the form to collect email in the confirmation modal
        // is hidden if gCalId and gCalEventId is not
        // found on the event
        // for a series, it would be for the
        // first event in the series
        await sendGCalInvite(rsvp);
      }
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
