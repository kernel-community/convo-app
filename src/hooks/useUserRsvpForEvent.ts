/**
 * used to check RSVP of a user for a given session in a convo
 * to check for user's RSVP in a convo see `useUserRsvpForConvo`
 */

import { useQuery } from "react-query";
import { useUser } from "src/context/UserContext";

const useUserRsvpForEvent = ({
  eventId,
  dontFetch,
}: {
  eventId: string;
  dontFetch: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const { data, refetch, isFetching } = useQuery(
    [`userRsvpForEvent-${user.id}-${eventId}`],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getUserRsvpForEvent", {
              body: JSON.stringify({ userId: user.id, event: eventId }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r.isRsvp as boolean;
      } catch (err) {
        throw err;
      }
    },
    {
      enabled: !dontFetch && !!user.id,
      refetchInterval: 5000,
    }
  );

  return {
    isFetching,
    refetch,
    isRsvpd: data,
  };
};

export default useUserRsvpForEvent;
