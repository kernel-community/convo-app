/**
 * used to check RSVP of a user for a given convo
 * to check for user's RSVP in a particular event in a convo see `useUserRsvpForEvent`
 */

import type { Rsvp } from "@prisma/client";
import { useQuery } from "react-query";
import { useUser } from "src/context/UserContext";

const useUserRsvpForConvo = ({
  hash,
  dontFetch = false,
}: {
  hash: string;
  dontFetch?: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const { data, refetch, isFetching } = useQuery(
    [`userRsvpForConvo-${user.id}-${hash}`],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getUserRsvpForConvo", {
              body: JSON.stringify({ userId: user.id, hash }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        console.log({ r });
        return r.rsvps as Array<Rsvp>;
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
    rsvps: data,
  };
};

export default useUserRsvpForConvo;
