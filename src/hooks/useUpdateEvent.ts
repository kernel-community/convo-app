import { useState } from "react";
import type { ClientEventInput, Session } from "src/components/ProposeForm";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";

// if the event is being edited, expect a hash in the object
// expect an id with each session object

const updateEventInDb = async ({
  event,
  signature,
  address,
}: {
  event: ClientEventInput;
  signature: string;
  address?: string | null;
}) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/update/event", {
          body: JSON.stringify({ event, signature, address }),
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

const useUpdateEvent = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const update = async ({
    event,
    signature,
    address,
  }: {
    event: ClientEventInput;
    signature: string;
    address?: string | null;
  }) => {
    if (!address) return;
    setIsSubmitting(true);

    // fetch array of events of the hash from db
    let updated: Array<FullEvent> | undefined = undefined;
    try {
      updated = await updateEventInDb({ event, signature, address });
    } catch (err) {
      setIsError(true);
      setIsSubmitting(false);
    }

    // @todo @angelagilhotra update event in google calendar

    setIsSubmitting(false);
    return updated;
  };

  return {
    isError,
    isSubmitting,
    update,
  };
};

export default useUpdateEvent;
