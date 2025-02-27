import { verifyDynamicToken } from "src/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const SESSION_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 365 * 24 * 60 * 60, // 1 year
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "no token fetched from authHeader" },
        { status: 401 }
      );
    }
    const user = await verifyDynamicToken(token);

    if (!user.verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Set session cookie with user info
    cookies().set(
      SESSION_COOKIE,
      JSON.stringify({
        id: user.id,
        email: user.email,
      }),
      SESSION_OPTIONS
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth] Error setting session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  // Clear session cookie
  cookies().delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
