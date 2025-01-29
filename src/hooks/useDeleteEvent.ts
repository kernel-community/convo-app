import { useState } from "react";

const deleteEventFromDb = async (
  eventHash: string
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch("/api/delete/event", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ eventHash }),
    });
    return response.json();
  } catch (err) {
    throw err;
  }
};

const useDeleteEvent = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEvent = async (eventHash: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const { success } = await deleteEventFromDb(eventHash);
      if (!success) {
        throw new Error("Failed to delete event");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteEvent,
    isDeleting,
    error,
  };
};

export default useDeleteEvent;
