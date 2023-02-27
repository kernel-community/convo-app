import { QueryClient, QueryClientProvider } from "react-query";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { env } from "src/env/client.mjs";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { GetSiweMessageOptions } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { Analytics } from "@vercel/analytics/react";
import { NextSeo } from "next-seo";

const queryClient = new QueryClient();
const { chains, provider } = configureChains(
  [mainnet],
  [alchemyProvider({ apiKey: env.NEXT_PUBLIC_ALCHEMY_ID }), publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "Convo",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Convo",
});

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{
  session: Session;
}>) => {
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
        ]}
      />
      <SessionProvider session={session}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider chains={chains}>
              <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />
              </QueryClientProvider>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </WagmiConfig>
      </SessionProvider>
      <Analytics />
    </>
  );
};

export default MyApp;
