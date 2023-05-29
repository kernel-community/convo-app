import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "react-query";
import { useAccount, useDisconnect } from "wagmi";

export type UserStatus = User & {
  isSignedIn: boolean;
};

export type FullUser = {
  fetchedUser: UserStatus;
  setFetchedUser: ({ id, nickname, address, isSignedIn }: UserStatus) => void;
};

const defaultFullUser: FullUser = {
  fetchedUser: {
    id: "",
    address: "",
    nickname: "",
    isSignedIn: false,
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFetchedUser: () => {},
};

const UserContext = createContext<FullUser>(defaultFullUser);

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(`useUser must be used within UseUserProvider`);
  }
  return context;
};

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSession();
  const { isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [fetchedUser, setFetchedUser] = useState<UserStatus>(
    defaultFullUser.fetchedUser
  );
  // const wallet = fetchedUser?.address;
  // const isSignedIn = fetchedUser.address.length > 0 && !isDisconnected;
  useQuery(
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
        setFetchedUser(() => {
          return {
            ...r,
            // the user was successfully found
            // in the database + the user is
            // connected via web3
            isSignedIn: true,
          };
        });
        return r;
      } catch (err) {
        /**
         * if user not found, disconnect wallet
         */
        disconnect();
        // throw err;
      }
    },
    {
      /**
       * only run if wallet is connected AND
       * data is available -> signed in
       */
      enabled: !isDisconnected && !!data,
    }
  );

  const value = useMemo(
    () => ({
      fetchedUser,
      setFetchedUser,
    }),
    [fetchedUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserProvider, useUser };
