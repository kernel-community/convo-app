import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

async function loadFont() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = new URL("/fonts/Nephilm/Nephilm.otf", baseUrl).toString();
    console.log("Fetching Nephilm from:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Font fetch failed with status ${response.status}`);
    }
    return response.arrayBuffer();
  } catch (e) {
    console.error("Font loading error:", e);
    throw e;
  }
}

export async function GET() {
  const fontData = await loadFont().catch((e) => {
    console.error("Failed to load font:", e);
    return null;
  });

  try {
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
            backgroundColor: "hsl(36, 50%, 96%)",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "150px",
                  fontFamily: fontData ? "Nephilm" : "system-ui",
                  color: "#000",
                  fontWeight: "600",
                  lineHeight: "1",
                }}
              >
                Convo.Cafe
              </div>
              {/* <div
                style={{
                  fontSize: "49px",
                  fontFamily: fontData ? "Nephilm" : "system-ui",
                  color: "#000",
                  fontStyle: "italic",
                  lineHeight: "1",
                  letterSpacing: "1.1",
                  marginLeft: "12px"
                }}
              >
                sow the kernel of a conversation
              </div> */}
            </div>
            <img
              src={`${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/images/logo.png`}
              alt="Convo Logo"
              width="180"
              height="180"
            />
          </div>
        </div>
      ),
      {
        fonts: fontData
          ? [
              {
                name: "Nephilm",
                data: fontData,
                style: "normal",
                weight: 400,
              },
            ]
          : undefined,

        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
