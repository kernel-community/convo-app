import { useQuery } from "react-query";
import { useUser } from "src/context/UserContext";

const useUserRsvpForEvent = ({
  eventId,
  fetchOverride,
}: {
  eventId: string;
  fetchOverride: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const { data, refetch, isFetching } = useQuery(
    [`userRsvpForEvent-${user.address}-${eventId}`],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getUserRsvpForEvent", {
              body: JSON.stringify({ address: user.address, event: eventId }),
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
      enabled: !!user.address && fetchOverride,
    }
  );

  return {
    isFetching,
    refetch,
    isRsvpd: data,
  };
};

export default useUserRsvpForEvent;
