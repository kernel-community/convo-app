// given a hash
// fetch event details
import { useQuery } from "react-query";
import { ClientEvent } from "src/types";

const useEvent = ({ hash }: { hash?: string | string[] }) => {
  const { isLoading, isError, data, refetch } = useQuery(
    `rsvp_${hash}`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getEventByHash", {
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
      refetchInterval: 60000,
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
