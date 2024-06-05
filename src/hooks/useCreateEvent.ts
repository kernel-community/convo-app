// submit an event from the propose form
// creates an event for the logged in user
import { useState } from "react";
import type { ClientEventInput } from "src/components/ProposeForm";
import type { FullEvent } from "src/app/api/actions/google/createEvent/route";

const createEventInDb = async ({
  event,
  userId,
}: {
  event: ClientEventInput;
  userId?: string | null;
}) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/create/event", {
          body: JSON.stringify({ event, userId }),
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

const useCreateEvent = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const create = async ({
    event,
    userId,
  }: {
    event: ClientEventInput;
    userId?: string | null;
  }) => {
    if (!userId) return;
    setIsSubmitting(true);

    let createdInDb: Array<FullEvent> | undefined = undefined;
    try {
      createdInDb = await createEventInDb({ event, userId });
    } catch (err) {
      setIsError(true);
      setIsSubmitting(false);
    }

    setIsSubmitting(false);
    return createdInDb;
  };

  return {
    isError,
    isSubmitting,
    create,
  };
};

export default useCreateEvent;
