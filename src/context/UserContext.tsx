import { useDynamicContext } from "@dynamic-labs/sdk-react";
import type { User } from "@prisma/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "react-query";

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
  const { isAuthenticated, handleLogOut, user } = useDynamicContext();
  const [fetchedUser, setFetchedUser] = useState<UserStatus>(
    defaultFullUser.fetchedUser
  );
  const userId = user?.userId;

  useQuery(
    [`user-${userId}`],
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/user", {
              body: JSON.stringify({ userId }),
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
            isSignedIn: isAuthenticated,
          };
        });
        return r;
      } catch (err) {
        /**
         * if user not found, disconnect
         */
        handleLogOut();
        // throw err;
      }
    },
    {
      /**
       * only run if wallet is connected AND
       * data is available -> signed in
       */
      enabled: isAuthenticated,
    }
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setFetchedUser(defaultFullUser.fetchedUser);
    }
  }, [isAuthenticated]);

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
