import type { User } from "@prisma/client";
import { useMutation } from "react-query";

const useUpdateUser = (defaultUser?: Partial<User>) => {
  const { mutateAsync, isLoading, isError } = useMutation<
    unknown,
    Error,
    Partial<User>
  >(async (userData) => {
    const dataToUpdate = userData || defaultUser;

    if (!dataToUpdate) {
      throw new Error("User data is required");
    }

    const response = await fetch("/api/update/user", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ user: dataToUpdate }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user");
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

export default useUpdateUser;
