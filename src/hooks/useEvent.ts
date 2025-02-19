// given a hash
// fetch event details
import { useQuery } from "react-query";
import type { ClientEvent } from "src/types";

const useEvent = ({
  hash,
  dontFetch = false,
}: {
  hash?: string | string[];
  dontFetch?: boolean;
}) => {
  const { isLoading, isError, data, refetch } = useQuery(
    `rsvp_${hash}`,
    async () => {
      try {
        const baseUrl = window.location.origin;
        const r = (
          await (
            await fetch(`${baseUrl}/api/query/getEventByHash`, {
              body: JSON.stringify({ hash }),
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
      refetchInterval: dontFetch ? false : 3000,
      enabled: !!hash,
    }
  );

  return {
    isLoading,
    isError,
    data: data as ClientEvent,
    refetch,
  };
};

export default useEvent;
