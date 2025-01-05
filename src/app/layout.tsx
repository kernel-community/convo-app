import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Convo Cafe",
  description: "Convo Cafe. Built at Kernel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        const storedData = localStorage.getItem('theme-storage');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let theme = prefersDark ? 'dark' : 'light';
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
        document.body.setAttribute('data-dynamic-theme', theme);
      })();
    `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div vaul-drawer-wrapper="" className="bg-background">
            {children}
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
