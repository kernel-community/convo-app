import type { Community } from "@prisma/client";
import { useQuery } from "react-query";

const useCurrentCommunity = () => {
  const { isLoading, isError, data, refetch } = useQuery(
    `community`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/community", {
              body: JSON.stringify({}),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    }
  );

  return {
    isLoading,
    isError,
    data: data as Community,
    refetch,
  };
};

export default useCurrentCommunity;
