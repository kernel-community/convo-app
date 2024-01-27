// submit an event from the propose form
// creates an event for the logged in user
import { useState } from "react";
import type { ClientEventInput } from "src/components/ProposeForm";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";

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

const createEventInGCal = async ({
  events,
  proposerEmail,
}: {
  events: Array<FullEvent>;
  proposerEmail?: string | null;
}) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/actions/google/createEvent", {
          body: JSON.stringify({ events, proposerEmail }),
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

const notifyAllChannelsOnSlack = async (id: string) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/actions/slack/notifyAll", {
          body: JSON.stringify({ eventId: id, type: "new" }),
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

    // @note
    // we don't want to display if an error occurs here
    // the cron job would eventually pick this up
    // or an external action can fix this
    // @help need a way for us to know this error occurred on the frontend
    try {
      if (createdInDb && event.gCalEvent) {
        const email = createdInDb[0]?.proposer.email;
        if (!email) {
          throw new Error(`email not found (${userId})`);
        }
        await createEventInGCal({
          events: createdInDb,
          proposerEmail: email,
        });
      }
    } catch (err) {
      console.error(`Error in creating event in google calendar`);
    }

    try {
      if (createdInDb && createdInDb[0]) {
        await notifyAllChannelsOnSlack(createdInDb[0].id);
      }
    } catch (err) {
      console.log(`Error in sending slack message notification`);
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
