import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

/**
 * Server-side function to check if the user is authenticated based on the session cookie
 */
export const checkSessionAuth = async (): Promise<boolean> => {
  try {
    // Get the session cookie directly on the server
    const sessionCookie = cookies().get(SESSION_COOKIE);

    // Check if the cookie exists and is valid
    if (sessionCookie?.value) {
      try {
        // Parse the cookie value to verify it's valid JSON
        const sessionData = JSON.parse(sessionCookie.value);

        // Check if the session contains the expected user data
        if (sessionData && sessionData.id) {
          return true;
        }
      } catch (e) {
        // Invalid JSON in cookie
        console.error("Invalid session cookie format:", e);
      }
    }

    return false;
  } catch (error) {
    console.error("[ServerAuth] Error checking session:", error);
    return false;
  }
};

/**
 * Server-side function to get the user ID from the session cookie
 */
export const getUserIdFromSession = (): string | null => {
  try {
    const sessionCookie = cookies().get(SESSION_COOKIE);
    if (!sessionCookie?.value) return null;

    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData?.id || null;
  } catch (error) {
    console.error("[ServerAuth] Error getting user ID:", error);
    return null;
  }
};
