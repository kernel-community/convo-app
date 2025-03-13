"use client";

/**
 * Client-side function to check if the user is authenticated based on the session cookie
 * This can be used as an alternative to the Dynamic SDK's isAuthenticated
 */
export const checkSessionAuth = async (): Promise<boolean> => {
  try {
    // Fetch the current session state from an endpoint we'll create
    const response = await fetch("/api/auth/session/check", {
      method: "GET",
      credentials: "include", // Important to include cookies
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error("Error checking session authentication:", error);
    return false;
  }
};

/**
 * Synchronous version that checks localStorage for cached user state
 * This can be used for initial UI rendering before async check completes
 */
export const hasLocalUserState = (): boolean => {
  if (typeof window === "undefined") return false;

  const userState = localStorage.getItem("user_state");
  return userState !== null && userState !== undefined;
};
