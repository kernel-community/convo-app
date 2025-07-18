import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";
import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox CSS
import { BetaModeWrapper } from "src/components/BetaModeWrapper";
// import { AuthDebug } from "src/components/debug/AuthDebug";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Convo Cafe | Plant the kernel of a conversation",
    template: "%s | Convo Cafe",
  },
  description:
    "Plant the kernel of a conversation. Connect, share, build together.",
  keywords: [
    "conversation",
    "community",
    "social",
    "events",
    "meetup",
    "kernel",
    "web3",
    "networking",
    "crypto",
    "cozy",
  ],
  authors: [{ name: "Kernel Community" }],
  metadataBase: new URL("https://www.convo.cafe"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.convo.cafe",
    siteName: "Convo Cafe",
    title: "Convo Cafe | Plant the kernel of a conversation",
    description:
      "Plant the kernel of a conversation. Connect, share, build together.",
    images: [
      {
        url: "https://www.convo.cafe/og-image.png",
        width: 1200,
        height: 630,
        alt: "Convo Cafe",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convo Cafe | Plant the kernel of a conversation",
    description:
      "Plant the kernel of a conversation. Connect, share, build together.",
    images: ["https://www.convo.cafe/og-image.png"],
    creator: "@kernel0x",
    site: "@kernel0x",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  verification: {
    google: "google-site-verification-code", // Add your verification code
  },
  alternates: {
    canonical: "https://www.convo.cafe",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Convo Cafe",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#F7F4F0",
    "theme-color": "#F7F4F0",
  },
};

// PWA handler script is injected in the head section

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We don't need to await the beta mode flag here
  // The client components will handle this through the context
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        try {
          const storedData = localStorage.getItem('theme-storage');
          let theme = 'light';
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              if (parsedData.state && parsedData.state.theme) {
                theme = parsedData.state.theme;
              }
            } catch (error) {
              console.error('Failed to parse theme-storage:', error);
            }
          }
          document.documentElement.classList.add(theme);
          document.documentElement.setAttribute('data-theme', theme);
        } catch (error) {
          // Fallback for environments without localStorage
          document.documentElement.classList.add('light');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      })();
    `,
          }}
        />
        <BetaModeWrapper>
          {(isBetaMode) => (
            <Providers isBetaMode={isBetaMode}>
              {children}
              {/* <AuthDebug /> */}
            </Providers>
          )}
        </BetaModeWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
