import type { RSVP_TYPE } from "@prisma/client";
import { useMutation, useQueryClient } from "react-query";
import { useUser } from "src/context/UserContext";

type RsvpMutationVariables = {
  eventId: string;
  type: RSVP_TYPE;
};

type RsvpApiResponse = {
  status: "SUCCESS" | "WAITLISTED";
  eventId: string;
};

const useUpdateRsvp = () => {
  const { fetchedUser } = useUser();
  const queryClient = useQueryClient();

  const updateRsvpApiCall = async ({
    eventId,
    type,
  }: RsvpMutationVariables): Promise<RsvpApiResponse> => {
    if (!fetchedUser?.id) {
      throw new Error("User not authenticated");
    }
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const response = await fetch("/api/create/rsvp", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        rsvp: {
          userId: fetchedUser.id,
          eventId: eventId,
          type: type,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data as RsvpApiResponse;
  };

  const { mutate, mutateAsync, isLoading, isError, error, data } = useMutation<
    RsvpApiResponse,
    Error,
    RsvpMutationVariables
  >(updateRsvpApiCall, {
    onSuccess: (data) => {
      console.log("RSVP mutation successful:", data);
      queryClient.invalidateQueries([`rsvp_${data.eventId}`]);
      queryClient.invalidateQueries([
        `userRsvpForConvo-${fetchedUser?.id}-${data.eventId}`,
      ]);
    },
    onError: (error) => {
      console.error("RSVP mutation failed:", error);
    },
  });

  return {
    updateRsvp: mutate,
    updateRsvpAsync: mutateAsync,
    isLoading,
    isError,
    error,
    data,
  };
};

export default useUpdateRsvp;
