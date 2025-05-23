"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "src/context/UserContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { updateUser } from "src/utils/updateUser";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";
import { TooltipProvider } from "src/components/ui/tooltip";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import { createContext, useContext } from "react";
import { CommunityProvider } from "src/context/CommunityContext";
import { Toaster } from "react-hot-toast";
import { DataLossBanner } from "src/components/DataLossBanner";
import { ScrambleProvider } from "src/context/ScrambleContext";
const queryClient = new QueryClient();

// Create a context for beta mode
export const BetaModeContext = createContext<boolean>(false);

// Hook to use beta mode
export const useBetaMode = () => useContext(BetaModeContext);

export default function Providers({
  children,
  isBetaMode,
}: Readonly<{
  children: React.ReactNode;
  isBetaMode?: boolean;
}>) {
  return (
    <BetaModeContext.Provider value={isBetaMode || false}>
      <DynamicContextProvider
        settings={{
          environmentId:
            process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
            "1a5bf4c4-4082-44b8-a8c2-d80d80c39feb",
          eventsCallbacks: {
            onAuthSuccess: async ({ primaryWallet, user, authToken }) => {
              // Create user in our database
              const createdUser = await updateUser({
                address: primaryWallet?.address,
                email: user.email,
                nickname: user.username || DEFAULT_USER_NICKNAME,
                id: user.userId,
              });

              // Set session using Dynamic's JWT
              await fetch("/api/auth/session", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              });

              return createdUser;
            },
            onUserProfileUpdate: async (user) => {
              const updatedUser = await updateUser({
                email: user.email,
                nickname: user.username || DEFAULT_USER_NICKNAME,
                id: user.userId,
              });
              return updatedUser;
            },
            onLogout: async () => {
              // Clear session cookie on logout
              await fetch("/api/auth/session", { method: "DELETE" });
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <CommunityProvider>
              <RsvpIntentionProvider>
                <TooltipProvider>
                  <DataLossBanner />
                  <ScrambleProvider>
                    <div vaul-drawer-wrapper="">{children}</div>
                  </ScrambleProvider>
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        background: "var(--background)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                        fontSize: "0.875rem",
                        maxWidth: "320px",
                        padding: "0.75rem 1rem",
                        fontFamily: "var(--font-inter)",
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: "var(--primary)",
                          secondary: "var(--primary-foreground)",
                        },
                      },
                    }}
                  />
                </TooltipProvider>
              </RsvpIntentionProvider>
            </CommunityProvider>
          </UserProvider>
        </QueryClientProvider>
      </DynamicContextProvider>
    </BetaModeContext.Provider>
  );
}
