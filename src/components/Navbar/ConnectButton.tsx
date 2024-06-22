"use client";
import { DynamicUserProfile, useDynamicContext } from "@dynamic-labs/sdk-react";
import { useUser } from "src/context/UserContext";
export const ConnectButton = () => {
  const { fetchedUser: user } = useUser();
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();
  if (user.isSignedIn) {
    // display user profile
    return (
      <div className="mb-1">
        <button onClick={() => setShowDynamicUserProfile(true)}>
          <span className="text-slate-400">Signing as</span>{" "}
          <span className="text-slate-200">{user.nickname}</span>
        </button>
        <DynamicUserProfile />
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
