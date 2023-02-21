// submit an event from the propose form
// creates an event for the logged in user
import { useState } from "react";
import type { ClientEventInput } from "src/components/ProposeForm";

const useCreateEvent = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const create = async ({
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
    let res;
    try {
      res = (
        await (
          await fetch("/api/create/event", {
            body: JSON.stringify({ event, signature, address }),
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
    isError,
    isSubmitting,
    create,
  };
};

export default useCreateEvent;
