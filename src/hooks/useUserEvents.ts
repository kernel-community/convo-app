import { useQuery } from "react-query";
import type { ClientEvent } from "src/types";

/**
 * Hook to fetch events related to a user - both events they've proposed and events they've RSVPed to
 */
const useUserEvents = ({ userId }: { userId?: string }) => {
  const { isLoading, isError, data, refetch } = useQuery(
    [`user-events-${userId}`],
    async () => {
      if (!userId) return { proposed: [], attending: [] };

      try {
        const response = await fetch("/api/query/getUserEvents", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user events");
        }

        const result = await response.json();
        return result.data;
      } catch (err) {
        console.error("Error fetching user events:", err);
        throw err;
      }
    },
    {
      enabled: !!userId,
      refetchInterval: 60000, // Refetch every minute
    }
  );

  return {
    isLoading,
    isError,
    data: data as {
      proposed: ClientEvent[];
      attending: ClientEvent[];
    },
    refetch,
  };
};

export default useUserEvents;
