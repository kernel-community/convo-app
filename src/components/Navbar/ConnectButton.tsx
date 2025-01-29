"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { useUser } from "src/context/UserContext";
export const ConnectButton = () => {
  const { fetchedUser: user } = useUser();
  const { setShowAuthFlow } = useDynamicContext();
  if (user.isSignedIn) {
    // display user profile
    return (
      <div className="mb-1">
        <a href="/profile">
          <span className="text-slate-400">Signing as</span>{" "}
          <span className="text-slate-200 dark:text-primary-dark">
            {user.nickname}
          </span>
        </a>
      </div>
    );
  }
  return (
    <div
      onClick={() => {
        setShowAuthFlow(true);
      }}
      className="mb-1
        cursor-pointer font-semibold lowercase text-highlight"
    >
      Log in
    </div>
  );
};
