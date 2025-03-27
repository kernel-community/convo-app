export async function parseLocation(text: string): Promise<string | null> {
  if (!text?.trim()) {
    return null;
  }

  try {
    // Get the base URL from environment or use a default for local development
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/action/parse-location`, {
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
    return data.location || null;
  } catch (error) {
    console.error("Error parsing location:", error);
    // Log the text that caused the error for debugging
    console.log("Input text:", text);
    return null;
  }
}
