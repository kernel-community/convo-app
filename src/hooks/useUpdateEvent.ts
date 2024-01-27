import { useState } from "react";
import type { ClientEventInput } from "src/components/ProposeForm";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";
import useCreateEvent from "./useCreateEvent";

// if the event is being edited, expect a hash in the object
// expect an id with each session object

const updateEventInDb = async ({
  event,
}: {
  event: ClientEventInput;
}): Promise<{
  updated: Array<FullEvent>;
  deleted: Array<FullEvent>;
}> => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/update/event", {
          body: JSON.stringify({ event }),
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

const updateEventInGCal = async ({
  events,
}: {
  events: { updated?: Array<FullEvent>; deleted?: Array<FullEvent> };
}) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/actions/google/updateEvent", {
          body: JSON.stringify({ events }),
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
  const { create } = useCreateEvent();

  const update = async ({ event }: { event: ClientEventInput }) => {
    setIsSubmitting(true);

    const toCreate: ClientEventInput = {
      ...event,
      sessions: event.sessions.filter(
        (session) => typeof session.id === "undefined"
      ),
    };
    const toUpdate: ClientEventInput = {
      ...event,
      sessions: event.sessions.filter(
        (session) => typeof session.id !== "undefined"
      ),
    };

    // fetch array of events of the hash from db
    let updated: Array<FullEvent> | undefined = undefined;
    let deleted: Array<FullEvent> | undefined = undefined;
    try {
      ({ updated, deleted } = await updateEventInDb({
        event: toUpdate,
      }));
      const userId = updated[0]?.proposer.id; // hacky. fix this
      if (toCreate.sessions.length > 0) {
        // takes care of adding to gcal too
        await create({ event: toCreate, userId });
      }
    } catch (err) {
      setIsError(true);
      setIsSubmitting(false);
    }

    // @todo @angelagilhotra update event in google calendar
    try {
      if (updated && event.gCalEvent) {
        await updateEventInGCal({ events: { updated, deleted } });
      }
    } catch (err) {
      console.log(`Error in updating events in google calendar`);
    }

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
