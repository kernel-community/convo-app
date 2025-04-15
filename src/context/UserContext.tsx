"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react";
import type { User } from "@prisma/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "react-query";
import { checkSessionAuth, hasLocalUserState } from "src/lib/checkSessionAuth";

export type UserStatus = Partial<User> & {
  isSignedIn: boolean;
  isKernelCommunityMember: boolean;
};

export type FullUser = {
  fetchedUser: UserStatus;
  setFetchedUser: ({ id, nickname, address, isSignedIn }: UserStatus) => void;
  handleSignOut: () => Promise<void>;
};

const defaultFullUser: FullUser = {
  fetchedUser: {
    id: undefined,
    address: undefined,
    nickname: undefined,
    isSignedIn: false,
    isKernelCommunityMember: false,
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFetchedUser: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleSignOut: async () => {},
};

const UserContext = createContext<FullUser>(defaultFullUser);

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UseUserProvider");
  }
  return context;
};

const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    isAuthenticated: sdkIsAuthenticated,
    handleLogOut,
    user,
  } = useDynamicContext();
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState<boolean>(
    hasLocalUserState()
  );
  const [fetchedUser, setFetchedUser] = useState<UserStatus>(
    defaultFullUser.fetchedUser
  );

  // Combined authentication state - user is authenticated if either SDK or session says so
  const isAuthenticated = sdkIsAuthenticated || isSessionAuthenticated;

  const isKernelCommunityMember = useMemo(() => {
    const email = user?.email;
    return email ? email.endsWith("@kernel.community") : false;
  }, [user?.email]);

  const userId = user?.userId;

  useQuery(
    ["user-" + userId],
    async () => {
      try {
        // Only proceed with the fetch if we have authentication
        if (!isAuthenticated) {
          return null;
        }

        const response = await fetch("/api/query/user", {
          body: JSON.stringify({ userId }), // userId might be undefined, but our API now handles this
          method: "POST",
          headers: { "Content-type": "application/json" },
        });

        const result = await response.json();

        // Check if we got a valid user response
        if (response.ok && result.data) {
          setFetchedUser(() => {
            return {
              ...result.data,
              // the user was successfully found
              // in the database + the user is
              // connected via web3
              isSignedIn: isAuthenticated,
              isKernelCommunityMember,
            };
          });
          return result.data;
        } else if (response.status === 400) {
          // No user ID available, but we're authenticated
          // This could happen during initial login before user is created
          console.log("No user ID available yet, but authenticated");
          return null;
        } else {
          // Other error occurred
          console.error("Error fetching user:", result.error);
          // Only log out if there's a serious error, not just missing user ID
          if (response.status !== 400) {
            handleLogOut();
          }
          return null;
        }
      } catch (err) {
        console.error("Exception when fetching user:", err);
        return null;
      }
    },
    {
      /**
       * Run whenever authentication state changes
       */
      enabled: true,
      // Don't keep retrying on error
      retry: false,
    }
  );

  // Check session authentication on mount and when SDK auth state changes
  useEffect(() => {
    const checkSession = async () => {
      const isSessionValid = await checkSessionAuth();
      setIsSessionAuthenticated(isSessionValid);
    };

    checkSession();
  }, [sdkIsAuthenticated]);

  useEffect(() => {
    // Only clear user state if we're definitely logged out from both SDK and session
    if (!isAuthenticated) {
      setFetchedUser(defaultFullUser.fetchedUser);
      localStorage.removeItem("user_state");
    }
  }, [isAuthenticated]);

  // Save user state to localStorage whenever it changes
  useEffect(() => {
    if (fetchedUser.isSignedIn) {
      localStorage.setItem("user_state", JSON.stringify(fetchedUser));
    }
  }, [fetchedUser]);

  // Add a handleSignOut function that immediately updates UI
  const handleSignOut = async () => {
    // Immediately set user as signed out for better UI responsiveness
    setFetchedUser({
      ...defaultFullUser.fetchedUser, // Reset to default completely
      isSignedIn: false,
    });

    // Also immediately set session state
    setIsSessionAuthenticated(false);

    // Then proceed with normal logout
    await handleLogOut();
  };

  const value = useMemo(
    () => ({
      fetchedUser,
      setFetchedUser,
      handleSignOut,
    }),
    [fetchedUser, handleLogOut, setFetchedUser, handleSignOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserProvider, useUser };
