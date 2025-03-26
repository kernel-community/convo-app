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
    // Only include the timezone for new events (no ID means it's a new event)
    let eventToSend = event;

    if (!event.id) {
      // This is a new event, so include the timezone
      const creationTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      eventToSend = {
        ...event,
        creationTimezone,
      };
    }

    const response = await fetch("/api/upsert/convo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: eventToSend,
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
