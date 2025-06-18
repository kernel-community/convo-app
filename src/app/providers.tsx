"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "src/context/UserContext";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "src/components/ui/tooltip";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import { createContext } from "react";
import { CommunityProvider } from "src/context/CommunityContext";
import { Toaster } from "react-hot-toast";
import { DataLossBanner } from "src/components/DataLossBanner";
import { ScrambleProvider } from "src/context/ScrambleContext";

const queryClient = new QueryClient();

// Create a context for beta mode
export const BetaModeContext = createContext<boolean>(false);

export default function Providers({
  children,
  isBetaMode,
}: Readonly<{
  children: React.ReactNode;
  isBetaMode?: boolean;
}>) {
  return (
    <BetaModeContext.Provider value={isBetaMode || false}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        signInUrl="/signin"
        signUpUrl="/signup"
        dynamic
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "shadow-lg",
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
      </ClerkProvider>
    </BetaModeContext.Provider>
  );
}
