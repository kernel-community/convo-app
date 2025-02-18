import type { RSVP_TYPE } from "@prisma/client";
import { useQuery } from "react-query";

type RsvpUpdateRequest = {
  userId: string | null | undefined;
  eventId: string | null | undefined;
  type: RSVP_TYPE;
};

const useUpdateRsvp = (rsvp: RsvpUpdateRequest) => {
  const { isLoading, isError, refetch } = useQuery(
    `rsvp_update`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/create/rsvp", {
              body: JSON.stringify({ rsvp }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      enabled: false,
    }
  );
  return {
    fetch: refetch,
    isLoading,
    isError,
  };
};

export default useUpdateRsvp;
