import { RSVP_TYPE } from "@prisma/client";
import { useUser } from "src/context/UserContext";
import type { ClientEvent } from "../types";

export const useRsvpStatus = (event: ClientEvent) => {
  const { fetchedUser } = useUser();
  const isUserGoing = fetchedUser
    ? event.rsvps.some(
        (rsvp) =>
          rsvp.attendee.id === fetchedUser.id &&
          rsvp.rsvpType === RSVP_TYPE.GOING
      )
    : false;
  return {
    isUserGoing,
    isUserMaybe: fetchedUser
      ? event.rsvps.some(
          (rsvp) =>
            rsvp.attendee.id === fetchedUser.id &&
            rsvp.rsvpType === RSVP_TYPE.MAYBE
        )
      : false,
    isUserNotGoing: fetchedUser
      ? event.rsvps.some(
          (rsvp) =>
            rsvp.attendee.id === fetchedUser.id &&
            rsvp.rsvpType === RSVP_TYPE.NOT_GOING
        )
      : false,
  };
};
