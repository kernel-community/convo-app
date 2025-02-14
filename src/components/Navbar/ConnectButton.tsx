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
      <div className="flex flex-col items-end text-[1.5rem] sm:flex-row sm:gap-1">
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
      className="cursor-pointer font-primary text-xl hover:underline hover:decoration-dotted hover:underline-offset-4"
    >
      Log in
    </div>
  );
};
