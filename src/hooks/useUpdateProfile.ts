import type { Profile } from "@prisma/client";
import { useMutation } from "react-query";

const useUpdateProfile = (defaultProfile?: Partial<Profile>) => {
  const { mutateAsync, isLoading, isError } = useMutation<
    unknown,
    Error,
    Partial<Profile>
  >(async (profileData) => {
    const dataToUpdate = profileData || defaultProfile;

    // Check if userId is provided
    if (!dataToUpdate?.userId) {
      throw new Error("userId is required to update profile");
    }

    const response = await fetch("/api/update/profile", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ profile: dataToUpdate }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const result = await response.json();
    return result.data;
  });

  return {
    fetch: mutateAsync,
    isLoading,
    isError,
  };
};

export default useUpdateProfile;
