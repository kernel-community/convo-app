import type { Profile } from "@prisma/client";
import { useQuery } from "react-query";

const useProfile = ({ userId }: { userId?: string }) => {
  const { isLoading, isError, data, refetch, isFetching } = useQuery(
    `profile_${userId}`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/profile", {
              body: JSON.stringify({ userId }),
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
      enabled: !!userId,
    }
  );

  return {
    isLoading,
    isFetching,
    isError,
    data: data as Profile,
    refetch,
  };
};

export default useProfile;
