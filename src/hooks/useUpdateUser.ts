import type { User } from "@prisma/client";
import { useQuery } from "react-query";

const useUpdateUser = (user: Partial<User>) => {
  const { isLoading, isError, refetch } = useQuery(
    `profile_update`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/update/user", {
              body: JSON.stringify({ user }),
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

export default useUpdateUser;
