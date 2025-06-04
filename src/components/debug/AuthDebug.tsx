"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useUser as useAppUser } from "src/context/UserContext";

export function AuthDebug() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { userId } = useAuth();
  const { fetchedUser } = useAppUser();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Check if we're on the client side
  const hasCookies =
    typeof document !== "undefined"
      ? document.cookie.includes("__session")
        ? "has session"
        : "no session"
      : "server-side";

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-96 max-w-sm overflow-y-auto rounded-lg bg-black/80 p-4 text-xs text-white">
      <h3 className="mb-2 font-bold">Auth Debug</h3>
      <div className="space-y-1">
        <div className="font-semibold text-green-400">Clerk State:</div>
        <div>isLoaded: {String(isLoaded)}</div>
        <div>isSignedIn: {String(isSignedIn)}</div>
        <div>userId: {userId || "null"}</div>
        <div>user.id: {user?.id || "null"}</div>
        <div>
          user.email: {user?.emailAddresses?.[0]?.emailAddress || "null"}
        </div>
        <div>user.firstName: {user?.firstName || "null"}</div>
        <div>cookies: {hasCookies}</div>

        <div className="mt-2 font-semibold text-blue-400">App State:</div>
        <div>fetchedUser.id: {fetchedUser.id || "null"}</div>
        <div>fetchedUser.isSignedIn: {String(fetchedUser.isSignedIn)}</div>
        <div>fetchedUser.nickname: {fetchedUser.nickname || "null"}</div>
        <div>fetchedUser.email: {fetchedUser.email || "null"}</div>
      </div>
    </div>
  );
}
