import type { Profile } from "@prisma/client";
import { useQuery } from "react-query";

const useUpdateProfile = (profile: Partial<Profile>) => {
  const { isLoading, isError, refetch } = useQuery(
    `profile_update`,
    async () => {
      try {
        // Check if userId is provided
        if (!profile.userId) {
          throw new Error("userId is required to update profile");
        }

        const r = (
          await (
            await fetch("/api/update/profile", {
              body: JSON.stringify({ profile }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        console.error("Error updating profile:", err);
        throw err;
      }
    },
    {
      enabled: false,
    }
  );
  return {
    fetch: refetch,
    isLoading,
    isError,
  };
};

export default useUpdateProfile;
