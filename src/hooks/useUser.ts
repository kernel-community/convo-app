/**
 * Checks if user is signed in
 * returns all users data if signed in
 */

import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useAccount, useQuery } from "wagmi";

const useUser = (): {
  isLoading: boolean;
  isError: boolean;
  user: User | undefined;
  refetch: () => void;
} => {
  const { data } = useSession();
  const { isDisconnected } = useAccount();
  const [fetchedUser, setFetchedUser] = useState<User | undefined>(undefined);

  const { isLoading, isError, refetch } = useQuery(
    ["user"],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/user", {
              body: JSON.stringify({ address: data?.user.address }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        setFetchedUser(r);
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      enabled: !isDisconnected && !!data,
    }
  );

  return {
    isLoading,
    isError,
    user: fetchedUser,
    refetch,
  };
};

export default useUser;
