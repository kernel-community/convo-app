"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "src/context/UserContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { updateUser } from "src/utils/updateUser";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";
import { TooltipProvider } from "src/components/ui/tooltip";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";
  const createUser = updateUser;
  const room = `convo-room-${process.env.NODE_ENV}`;
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
      <DynamicWagmiConnector>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <div
              vaul-drawer-wrapper=""
              suppressHydrationWarning
              className="bg-background"
            >
              <CursorsContextProvider room={room} host={host}>
                <SharedSpace>
                  <TooltipProvider>{children}</TooltipProvider>
                </SharedSpace>
              </CursorsContextProvider>
            </div>
          </UserProvider>
        </QueryClientProvider>
      </DynamicWagmiConnector>
    </DynamicContextProvider>
  );
}