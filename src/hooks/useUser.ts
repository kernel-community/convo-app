/**
 * Checks if user is signed in
 * returns all users data if signed in
 */

import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useAccount, useQuery } from "wagmi";

const useUser = ({
  address,
}: {
  address: string | undefined | null;
}): {
  isLoading: boolean;
  isError: boolean;
  user: User;
  refetch: () => void;
} => {
  const { data } = useSession();
  const { isDisconnected } = useAccount();

  const {
    isLoading,
    isError,
    data: user,
    refetch,
  } = useQuery(
    ["user"],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/user", {
              body: JSON.stringify({ address }),
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
      enabled: !isDisconnected && !!data && !!address,
    }
  );

  return {
    isLoading,
    isError,
    user,
    refetch,
  };
};

export default useUser;
