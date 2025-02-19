import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";

// Define the screenshot type
type Screenshot = {
  src: string;
  sizes?: string;
  type?: string;
  form_factor?: "narrow" | "wide";
};

// Extend the base manifest type
type ExtendedManifest = Omit<MetadataRoute.Manifest, "screenshots"> & {
  screenshots?: Screenshot[];
};

export async function GET() {
  const manifest: ExtendedManifest = {
    name: "Convo Cafe",
    short_name: "Convo",
    description:
      "Plant the kernel of a conversation. Connect, share, build together.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F4F0",
    theme_color: "#F7F4F0",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/images/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };

  return NextResponse.json(manifest);
}
