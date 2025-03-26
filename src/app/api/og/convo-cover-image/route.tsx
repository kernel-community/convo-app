/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { DateTime } from "luxon";
import { rrulestr } from "rrule";
import { cleanupRruleString } from "src/utils/cleanupRruleString";
import QRCode from "qrcode";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadFonts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.convo.cafe";

    // Load Nephilm font
    const nephilmUrl = new URL(
      "/fonts/Nephilm/Nephilm.otf",
      baseUrl
    ).toString();
    console.log("Fetching Nephilm from:", nephilmUrl);
    const nephilmResponse = await fetch(nephilmUrl);
    if (!nephilmResponse.ok) {
      throw new Error(
        `Nephilm font fetch failed with status ${nephilmResponse.status}`
      );
    }
    const nephilmFont = await nephilmResponse.arrayBuffer();

    // Load Lora Medium Italic font
    const loraMediumItalicUrl = new URL(
      "/fonts/Lora/Lora-MediumItalic.ttf",
      baseUrl
    ).toString();
    console.log("Fetching Lora Medium Italic from:", loraMediumItalicUrl);
    const loraMediumItalicResponse = await fetch(loraMediumItalicUrl);
    if (!loraMediumItalicResponse.ok) {
      throw new Error(
        `Lora Medium Italic font fetch failed with status ${loraMediumItalicResponse.status}`
      );
    }
    const loraMediumItalicFont = await loraMediumItalicResponse.arrayBuffer();

    // Load Lora Regular font
    const loraRegularUrl = new URL(
      "/fonts/Lora/Lora-Regular.ttf",
      baseUrl
    ).toString();
    console.log("Fetching Lora Regular from:", loraRegularUrl);
    const loraRegularResponse = await fetch(loraRegularUrl);
    if (!loraRegularResponse.ok) {
      throw new Error(
        `Lora Regular font fetch failed with status ${loraRegularResponse.status}`
      );
    }
    const loraRegularFont = await loraRegularResponse.arrayBuffer();

    return { nephilmFont, loraMediumItalicFont, loraRegularFont };
  } catch (e) {
    console.error("Font loading error:", e);
    throw e;
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const rawTitle = searchParams.get("title") || "";
  const startDateTime = searchParams.get("startDateTime");
  const recurrenceRule = searchParams.get("recurrenceRule");
  const proposerNickname = searchParams.get("proposerNickname");
  const eventHash = searchParams.get("eventHash");
  const creationTimezone = searchParams.get("creationTimezone");

  // Get the domain from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.convo.cafe";
  const domain = new URL(baseUrl).hostname;

  // Truncate title if it's too long (max 100 chars)
  const title =
    rawTitle.length > 100 ? rawTitle.substring(0, 97) + "..." : rawTitle;

  if (!title || !startDateTime) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const { nephilmFont, loraMediumItalicFont, loraRegularFont } =
    await loadFonts();

  // Format date and time
  let dt = DateTime.fromISO(startDateTime);

  // If we have a creation timezone, use it to format the time
  if (creationTimezone) {
    dt = dt.setZone(creationTimezone);
  }

  const formattedDate = dt.toFormat("cccc, LLLL d");
  const formattedTime = dt.toFormat("h:mm a");

  // Add the timezone name to the formatted time
  const timezoneName = creationTimezone
    ? ` (${creationTimezone.replace(/\//g, " ")})`
    : ` (UTC${dt.toFormat("ZZ")})`;

  // Generate QR code for the RSVP URL
  const rsvpUrl = `${baseUrl}/rsvp/${eventHash}`;
  const qrCodeSvg = await QRCode.toString(rsvpUrl, {
    type: "svg",
    width: 70,
    margin: 0,
    color: {
      dark: "#4D4D4D",
      light: "#F7F4F0",
    },
  });

  // Convert SVG to data URL
  const qrCodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(
    qrCodeSvg
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7F4F0",
          padding: "1.5rem",
          fontFamily: "Lora Regular",
          color: "rgb(77, 77, 77)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            padding: "1rem",
            width: "100%",
            height: "100%",
            gap: "1.5rem",
            position: "relative",
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              left: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <img
              src={`${baseUrl}/images/logo.png`}
              width="55"
              height="55"
              alt="Convo Logo"
              style={{ width: "55px", height: "55px" }}
            />
          </div>
          {/* Content Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              flex: 1,
              width: "100%",
              maxWidth: "85%",
            }}
          >
            {/* Title and Proposer Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: title.length > 50 ? 64 : 72,
                  textAlign: "center",
                  lineHeight: 1.2,
                  fontFamily: "Lora Medium Italic",
                  width: "100%",
                  minHeight: proposerNickname
                    ? title.length > 50
                      ? 150
                      : 120
                    : title.length > 50
                    ? 180
                    : 140,
                  maxHeight: proposerNickname ? 160 : 200,
                }}
              >
                <div
                  style={{
                    maxWidth: "90%",
                    padding: "0.2em",
                    display: "-webkit-box",
                    WebkitLineClamp: proposerNickname
                      ? title.length > 50
                        ? 2
                        : 2
                      : title.length > 50
                      ? 3
                      : 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </div>
              </div>

              {/* Proposer - positioned directly under the title */}
              {proposerNickname && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: "rgb(128, 128, 128)",
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>by {proposerNickname}</span>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: 32,
                  color: "rgb(77, 77, 77)",
                }}
              >
                <span>{formattedDate}</span>
                <span style={{ color: "rgb(217, 204, 191)" }}>|</span>
                <span>
                  {formattedTime}
                  {timezoneName}
                </span>
              </div>

              {recurrenceRule && (
                <div
                  style={{
                    fontSize: 24,
                    color: "rgb(128, 128, 128)",
                    fontFamily: "Lora Regular",
                  }}
                >
                  {rrulestr(cleanupRruleString(recurrenceRule)).toText()}
                </div>
              )}
            </div>

            {/* Proposer is now moved up directly under the title */}
          </div>

          {/* Bottom bar with RSVP link, QR code, and Convo Cafe */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              padding: "1.5rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              background: "rgba(247, 244, 240, 0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              {/* QR Code */}
              <img
                src={qrCodeDataUrl}
                width="60"
                height="60"
                alt="RSVP QR Code"
                style={{
                  borderRadius: "4px",
                }}
              />
              {eventHash && (
                <span
                  style={{
                    fontSize: 16,
                    color: "rgb(128, 128, 128)",
                    fontStyle: "italic",
                  }}
                >
                  {domain}/rsvp/{eventHash}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "rgb(128, 128, 128)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontFamily: "Nephilm" }}>Convo.Cafe</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Nephilm",
          data: nephilmFont,
          style: "normal",
        },
        {
          name: "Lora Medium Italic",
          data: loraMediumItalicFont,
          style: "normal",
        },
        {
          name: "Lora Regular",
          data: loraRegularFont,
          style: "normal",
        },
      ],
    }
  );
}
