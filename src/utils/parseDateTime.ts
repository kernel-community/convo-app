interface DateTimeResponse {
  start: string;
  end: string;
}

export async function parseDateTime(
  text: string
): Promise<DateTimeResponse | null> {
  if (!text?.trim()) {
    return null;
  }

  try {
    const response = await fetch("/api/action/parse-datetime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        now: new Date().toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
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
