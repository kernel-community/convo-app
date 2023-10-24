import type { User } from "@prisma/client";

export const updateUser = async (user: Partial<User>) => {
  let res;
  try {
    res = (
      await (
        await fetch("/api/update/user", {
          body: JSON.stringify({ user }),
          method: "POST",
          headers: { "Content-type": "application/json" },
        })
      ).json()
    ).data;
  } catch (err) {
    throw err;
  }
  return res;
};
