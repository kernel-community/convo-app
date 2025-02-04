import type { ClientEventInput } from "src/types";

export const upsertConvo = async (event: ClientEventInput, userId?: string) => {
  // Basic validation
  if (!event) {
    throw new Error("Event is required");
  }

  if (!event.title) {
    throw new Error("Event title is required");
  }

  if (!event.dateTimeStartAndEnd?.start || !event.dateTimeStartAndEnd?.end) {
    throw new Error("Event start and end dates are required");
  }

  try {
    const response = await fetch("/api/upsert/convo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to upsert convo:", errorData);
      throw new Error(errorData || "Failed to upsert convo");
    }

    return response.json();
  } catch (error) {
    console.error("Error in upsertConvo:", error);
    throw error;
  }
};
