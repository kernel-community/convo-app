import type { User } from "@prisma/client";
import { isNil } from "lodash";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "react-query";
import { useAccount, useDisconnect } from "wagmi";
import { signOut } from "next-auth/react";

export type UserStatus = Partial<User> & {
  isSignedIn: boolean;
};

export type FullUser = {
  fetchedUser: UserStatus;
  setFetchedUser: ({ id, nickname, address, isSignedIn }: UserStatus) => void;
};

const defaultFullUser: FullUser = {
  fetchedUser: {
    id: undefined,
    address: undefined,
    nickname: undefined,
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
  const { isDisconnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [fetchedUser, setFetchedUser] = useState<UserStatus>(
    defaultFullUser.fetchedUser
  );

  // const wallet = fetchedUser?.address;
  // const isSignedIn = fetchedUser.address.length > 0 && !isDisconnected;

  useQuery(
    [`user-${data?.user.address}`],
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

  useEffect(() => {
    if (
      address !== fetchedUser.address &&
      !isNil(address) &&
      !isNil(fetchedUser.address)
    ) {
      // @help the only case where this is catastrophic (choice of word, lol)
      // is when the user has filled up the propose form
      // and then they switch their account in their wallet
      // the app would reload, and the user signed out
      // not sure what's the best way to handle account switching
      signOut();
    }
  }, [address, fetchedUser, disconnect]);

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
