// given an id
// fetch event details
// @dev use this when a fetch for a particular session is required

import { useQuery } from "react-query";
import type { ClientEvent } from "src/types";

const useEventsFromId = ({ ids }: { ids?: string[] } = { ids: [] }) => {
  const { isLoading, isError, data, refetch } = useQuery(
    `rsvp_${JSON.stringify(ids)}`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getEventByIds", {
              body: JSON.stringify({ ids }),
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
      refetchInterval: 60000,
      enabled: ids && ids.length > 0,
    }
  );

  return {
    isLoading,
    isError,
    data: data as ClientEvent,
    refetch,
  };
};

export default useEventsFromId;
