export async function parseLocation(text: string): Promise<string | null> {
  if (!text?.trim()) {
    return null;
  }

  try {
    const response = await fetch("/api/action/parse-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to parse location");
    }

    const data = await response.json();
    if (!data) return null;
    if (!data.location) return null;
    console.log({ data });
    return data.location || null;
  } catch (error) {
    console.error("Error parsing location:", error);
    // Log the text that caused the error for debugging
    console.log("Input text:", text);
    return null;
  }
}
