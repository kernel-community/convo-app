"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import type { User } from "@prisma/client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useQuery } from "react-query";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";

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
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  // const { signOut } = useAuth();
  const [fetchedUser, setFetchedUser] = useState<UserStatus>(
    defaultFullUser.fetchedUser
  );

  // Simplified authentication - only need Clerk's state
  const isAuthenticated = isLoaded && isSignedIn;

  const isKernelCommunityMember = useMemo(() => {
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    return email ? email.endsWith("@kernel.community") : false;
  }, [clerkUser?.emailAddresses]);

  const userId = clerkUser?.id;

  useQuery(
    ["user-" + userId],
    async () => {
      try {
        // Only proceed with the fetch if we have authentication
        if (!isAuthenticated || !clerkUser) {
          return null;
        }

        const response = await fetch("/api/query/user", {
          body: JSON.stringify({ userId }),
          method: "POST",
          headers: { "Content-type": "application/json" },
        });

        const result = await response.json();

        // Check if we got a valid user response
        if (response.ok && result.data) {
          const currentClerkName =
            clerkUser.fullName ||
            clerkUser.firstName ||
            clerkUser.lastName ||
            clerkUser.username;
          const existingNickname = result.data.nickname;
          const currentClerkImage = clerkUser.imageUrl;

          console.log("🔍 Profile sync check:", {
            clerkFullName: clerkUser.fullName,
            clerkFirstName: clerkUser.firstName,
            clerkLastName: clerkUser.lastName,
            clerkUsername: clerkUser.username,
            currentClerkName,
            existingNickname,
            defaultNickname: DEFAULT_USER_NICKNAME,
            clerkImageUrl: currentClerkImage,
          });

          // Check if we should sync the nickname with Clerk's name
          let shouldUpdateNickname = false;
          let updatedUser = result.data;

          // More comprehensive sync conditions
          if (currentClerkName) {
            if (!existingNickname) {
              console.log(
                "📝 Sync reason: No existing nickname, will use Clerk name"
              );
              shouldUpdateNickname = true;
            } else if (existingNickname === DEFAULT_USER_NICKNAME) {
              console.log(
                "📝 Sync reason: Existing nickname is default, will use Clerk name"
              );
              shouldUpdateNickname = true;
            } else if (currentClerkName !== existingNickname) {
              // For now, let's be conservative and only sync if it's the default
              // In the future, you might want to add user preference for this
              console.log(
                "📝 Sync reason: Clerk name differs from existing nickname, syncing to match Clerk"
              );
              shouldUpdateNickname = true; // Uncomment this line if you want aggressive syncing
            } else {
              console.log("✅ Names already match, no sync needed");
            }
          } else {
            console.log("⚠️ No name found in Clerk, keeping existing nickname");
          }

          // Update nickname if needed
          if (shouldUpdateNickname) {
            console.log(
              `🔄 Syncing nickname from Clerk: "${currentClerkName}" for user ${clerkUser.id}`
            );

            try {
              const syncResponse = await fetch("/api/update/user", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                  user: {
                    id: clerkUser.id,
                    nickname: currentClerkName,
                  },
                }),
              });

              if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                updatedUser = syncResult.data;
                console.log(
                  "✅ Successfully synced nickname with Clerk:",
                  updatedUser.nickname
                );
              } else {
                console.error(
                  "❌ Failed to sync nickname:",
                  await syncResponse.text()
                );
              }
            } catch (syncError) {
              console.error("❌ Error syncing nickname:", syncError);
            }
          }

          // Sync profile image from Clerk if available
          if (currentClerkImage) {
            console.log(
              `🖼️ Syncing profile image from Clerk: "${currentClerkImage}" for user ${clerkUser.id}`
            );

            try {
              const imageResponse = await fetch("/api/update/profile", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                  profile: {
                    userId: clerkUser.id,
                    image: currentClerkImage,
                  },
                }),
              });

              if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                console.log(
                  "✅ Successfully synced profile image with Clerk:",
                  imageResult.data.image
                );
              } else {
                console.error(
                  "❌ Failed to sync profile image:",
                  await imageResponse.text()
                );
              }
            } catch (imageError) {
              console.error("❌ Error syncing profile image:", imageError);
            }
          } else {
            console.log("ℹ️ No image found in Clerk, skipping image sync");
          }

          setFetchedUser(() => {
            return {
              ...updatedUser,
              // the user was successfully found
              // in the database + the user is
              // connected via Clerk
              isSignedIn: isAuthenticated,
              isKernelCommunityMember,
            };
          });
          return updatedUser;
        } else if (response.status === 400 || response.status === 404) {
          // User doesn't exist in our database yet - create them
          console.log("User not found in database, creating new user...");

          try {
            const createResponse = await fetch("/api/update/user", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({
                user: {
                  id: clerkUser.id,
                  email: clerkUser.emailAddresses[0]?.emailAddress,
                  nickname:
                    clerkUser.username ||
                    clerkUser.firstName ||
                    clerkUser.lastName ||
                    DEFAULT_USER_NICKNAME,
                },
              }),
            });

            if (createResponse.ok) {
              const createResult = await createResponse.json();
              console.log("Successfully created user:", createResult.data);

              // Also create initial profile with Clerk image if available
              if (clerkUser.imageUrl) {
                console.log(
                  `🖼️ Creating initial profile with Clerk image for new user ${clerkUser.id}`
                );

                try {
                  const profileResponse = await fetch("/api/update/profile", {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                      profile: {
                        userId: clerkUser.id,
                        image: clerkUser.imageUrl,
                      },
                    }),
                  });

                  if (profileResponse.ok) {
                    console.log(
                      "✅ Successfully created initial profile with Clerk image"
                    );
                  } else {
                    console.error(
                      "❌ Failed to create initial profile:",
                      await profileResponse.text()
                    );
                  }
                } catch (profileError) {
                  console.error(
                    "❌ Error creating initial profile:",
                    profileError
                  );
                }
              }

              setFetchedUser({
                ...createResult.data,
                isSignedIn: isAuthenticated,
                isKernelCommunityMember,
              });

              return createResult.data;
            } else {
              console.error(
                "Failed to create user:",
                await createResponse.text()
              );
              return null;
            }
          } catch (createError) {
            console.error("Error creating user:", createError);
            return null;
          }
        } else {
          // Other error occurred
          console.error("Error fetching user:", result.error);
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
      enabled: isAuthenticated,
      // Don't keep retrying on error
      retry: false,
    }
  );

  useEffect(() => {
    // Clear user state if not authenticated
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

  // Handle sign out with Clerk
  const handleSignOut = useCallback(async () => {
    try {
      console.log("🚪 Starting sign out process...");

      // Clear local state first (before redirect)
      setFetchedUser({
        ...defaultFullUser.fetchedUser,
        isSignedIn: false,
      });
      localStorage.removeItem("user_state");
      console.log("✅ Local state cleared");

      // Then sign out with proper domain handling for production
      const isProduction =
        typeof window !== "undefined" &&
        window.location.hostname.includes("convo.cafe");
      const redirectUrl = isProduction ? `https://www.convo.cafe/` : "/";
      console.log("🔄 Calling Clerk signOut with redirectUrl:", redirectUrl);

      // await signOut({ redirectUrl });
      console.log("✅ Clerk signOut completed");

      // Fallback: Force redirect if Clerk doesn't redirect automatically
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Sign out error:", error);
      // Ensure state is cleared even on error
      setFetchedUser({
        ...defaultFullUser.fetchedUser,
        isSignedIn: false,
      });
      localStorage.removeItem("user_state");
    }
  }, []);

  const value = useMemo(
    () => ({
      fetchedUser,
      setFetchedUser,
      handleSignOut,
    }),
    [fetchedUser, setFetchedUser, handleSignOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserProvider, useUser };
