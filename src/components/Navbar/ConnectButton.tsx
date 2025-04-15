"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useUser } from "src/context/UserContext";
import { useEffect, useState } from "react";

export const ConnectButton = () => {
  const { fetchedUser: user } = useUser();
  const { setShowDynamicUserProfile, setShowAuthFlow } = useDynamicContext();
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Sync state with user.isSignedIn for more consistent rendering
  useEffect(() => {
    setIsSignedIn(user.isSignedIn);
  }, [user.isSignedIn]);

  if (isSignedIn) {
    // display user profile
    return (
      <div
        key="signed-in"
        className="flex flex-col items-end sm:flex-row sm:gap-1 sm:text-xl"
      >
        <div className="hidden">
          <DynamicWidget />
        </div>
        <span className="">signing as</span>{" "}
        <span
          className="cursor-pointer underline decoration-dotted underline-offset-4"
          onClick={() => {
            setShowDynamicUserProfile(true);
          }}
        >
          {user.nickname}
        </span>
      </div>
    );
  }

  return (
    <div
      key="signed-out"
      onClick={() => {
        setShowAuthFlow(true);
      }}
      className="cursor-pointer font-primary hover:underline hover:decoration-dotted hover:underline-offset-4 sm:text-xl"
    >
      Log in
    </div>
  );
};
