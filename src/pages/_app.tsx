import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "src/context/UserContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { updateUser } from "src/utils/updateUser";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TooltipProvider } from "src/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Head from "next/head";

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps: { ...pageProps } }: AppProps) => {
  const router = useRouter();
  const createUser = updateUser;
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST;
  if (!host) {
    throw new Error("NEXT_PUBLIC_PARTYKIT_SERVER_HOST not defined");
  }
  const [room, setRoom] = useState<string>("convo-room");
  useEffect(() => {
    const route = router.asPath.replace(/[^a-zA-Z ]/g, "");
    setRoom(`convo-room-${route}-${process.env.NODE_ENV}`);
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>Convo Cafe</title>
        <meta name="description" content="The kernel of a conversation" />

        {/* OpenGraph */}
        <meta property="og:title" content={`Convo Cafe`} key="title" />
        <meta property="og:url" content={`https://convo.cafe`} />
        <meta
          property="og:image"
          content="https://confab-frontend.vercel.app/images/banner.jpg"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Convo Cafe`} />
        <meta
          name="twitter:image"
          content="https://confab-frontend.vercel.app/images/banner.jpg"
        />

        <meta name="robots" content="index, follow, nocache" />
        <meta
          name="googlebot"
          content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
        />
      </Head>
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
                    <TooltipProvider>
                      <Component {...pageProps} />
                    </TooltipProvider>
                  </SharedSpace>
                </CursorsContextProvider>
              </div>
            </UserProvider>
          </QueryClientProvider>
        </DynamicWagmiConnector>
      </DynamicContextProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default MyApp;
