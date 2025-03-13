import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";

export async function GET() {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get(SESSION_COOKIE);

    // Check if the cookie exists and is valid
    if (sessionCookie?.value) {
      try {
        // Parse the cookie value to verify it's valid JSON
        const sessionData = JSON.parse(sessionCookie.value);

        // Check if the session contains the expected user data
        if (sessionData && sessionData.id) {
          return NextResponse.json({
            authenticated: true,
            userId: sessionData.id,
          });
        }
      } catch (e) {
        // Invalid JSON in cookie
        console.error("Invalid session cookie format:", e);
      }
    }

    // If we get here, either no cookie or invalid cookie
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("[Auth] Error checking session:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
