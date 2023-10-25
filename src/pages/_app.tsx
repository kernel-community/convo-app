import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { NextSeo } from "next-seo";
import { UserProvider } from "src/context/UserContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { updateUser } from "src/utils/updateUser";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps: { ...pageProps } }: AppProps) => {
  const createUser = updateUser;
  return (
    <>
      <NextSeo
        titleTemplate="Convo | %s"
        defaultTitle="KERNEL Convo"
        description="A home for conversations taking place in the Kernel network"
        openGraph={{
          url: "https://convo.kernel.community",
          title: "KERNEL Conversations",
          description:
            "A home for conversations taking place in the Kernel network",
          images: [
            {
              url: "https://confab-frontend.vercel.app/images/banner.jpg",
              alt: "KERNEL squares and circles",
              type: "image/jpeg",
            },
          ],
          site_name: "KERNEL Convo",
        }}
        twitter={{
          handle: "@kernel0x",
          site: "https://kernel.community",
          cardType: "summary_large_image",
        }}
        additionalLinkTags={[
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@200;300;400;500;600;700;800;900&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300;1,400;1,500;1,700;1,800&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Licorice&display=swap",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
          },
          {
            rel: "preload",
            href: "/fonts/Futura/futura-medium.ttf",
            as: "font",
            crossOrigin: "anonymous",
          },
          {
            rel: "preload",
            href: "/fonts/Cedarville_Cursive/CedarvilleCursive-Regular.ttf",
            as: "font",
            crossOrigin: "anonymous",
          },
          {
            rel: "preload",
            href: "/fonts/Holland_Land/Holland-Land.ttf",
            as: "font",
            crossOrigin: "anonymous",
          },
        ]}
      />
      <DynamicContextProvider
        settings={{
          environmentId:
            process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
            "1a5bf4c4-4082-44b8-a8c2-d80d80c39feb",
          eventsCallbacks: {
            onAuthSuccess: async ({ user, primaryWallet }) => {
              await createUser({
                address: primaryWallet?.address,
                email: user.email,
                nickname: user.username || DEFAULT_USER_NICKNAME,
                id: user.userId, // @dev @note important
              });
            },
            onUserProfileUpdate: async (user) => {
              await updateUser({
                email: user.email,
                nickname: user.username || DEFAULT_USER_NICKNAME,
                id: user.userId, // @dev @note important
              });
            },
          },
        }}
      >
        <DynamicWagmiConnector>
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <Component {...pageProps} />
            </UserProvider>
          </QueryClientProvider>
        </DynamicWagmiConnector>
      </DynamicContextProvider>
      <Analytics />
    </>
  );
};

export default MyApp;
