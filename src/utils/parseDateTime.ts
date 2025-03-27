import { formatWithTimezone } from "./formatWithTimezone";

interface DateTimeResponse {
  start: string;
  end: string;
}

export async function parseDateTime(
  text: string,
  now: string,
  tzOffset: string
): Promise<DateTimeResponse | null> {
  if (!text?.trim()) {
    return null;
  }
  console.log("parseDateTime.ts time debug:", {
    inputNow: now,
    tzOffset,
  });
  const nowDate = new Date(now);
  console.log("after new Date():", {
    nowDate,
    nowDateISO: nowDate.toISOString(),
  });
  const formattedNow = formatWithTimezone(nowDate, tzOffset);
  try {
    // Get the base URL from environment or use a default for local development
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/action/parse-datetime`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        now: formattedNow,
        tzOffset,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to parse datetime");
    }

    const data = await response.json();
    if (!data.start || !data.end) return null;

    console.log({ data, now: new Date().toISOString() });

    return {
      start: data.start,
      end: data.end,
    };
  } catch (error) {
    console.error("Error parsing date/time:", error);
    return null;
  }
}
