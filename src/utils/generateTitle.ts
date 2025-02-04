interface GenerateTitleResponse {
  title: string;
  dateTime: {
    start: string;
    end: string;
  } | null;
}

export async function generateTitle(
  description?: string
): Promise<GenerateTitleResponse> {
  if (!description?.trim()) {
    return { title: "Untitled Convo", dateTime: null };
  }

  try {
    const response = await fetch("/api/actions/generate-title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to a simple title
    return {
      title: description?.split("\n")?.[0]?.slice(0, 40) || "Untitled Convo",
      dateTime: null,
    };
  }
}
