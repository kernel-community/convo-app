"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "src/context/UserContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { updateUser } from "src/utils/updateUser";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";
import { TooltipProvider } from "src/components/ui/tooltip";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";
  const createUser = updateUser;
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
          "1a5bf4c4-4082-44b8-a8c2-d80d80c39feb",
        eventsCallbacks: {
          onAuthSuccess: async ({ primaryWallet, user }) => {
            const createdUser = await createUser({
              address: primaryWallet?.address,
              email: user.email,
              nickname: user.username || DEFAULT_USER_NICKNAME,
              id: user.userId, // @dev @note important
            });
            return createdUser;
          },
          onUserProfileUpdate: async (user) => {
            const updatedUser = await updateUser({
              email: user.email,
              nickname: user.username || DEFAULT_USER_NICKNAME,
              id: user.userId, // @dev @note important
            });
            return updatedUser;
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <RsvpIntentionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </RsvpIntentionProvider>
        </UserProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}
