"use client";
// import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUser } from "src/context/UserContext";
export const ConnectButton = () => {
  const { fetchedUser: user } = useUser();
  const { setShowDynamicUserProfile } = useDynamicContext();
  const { setShowAuthFlow } = useDynamicContext();
  if (user.isSignedIn) {
    // display user profile
    return (
      <div>
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
      onClick={() => {
        setShowAuthFlow(true);
      }}
      className="cursor-pointer font-primary hover:underline hover:decoration-dotted hover:underline-offset-4"
    >
      Log in
    </div>
  );
};
