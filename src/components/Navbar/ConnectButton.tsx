import { DynamicUserProfile, useDynamicContext } from "@dynamic-labs/sdk-react";
import { SquareUserRound } from "lucide-react";
import { useUser } from "src/context/UserContext";

export const ConnectButton = () => {
  const { fetchedUser: user } = useUser();
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();
  if (user.isSignedIn) {
    // display user profile
    return (
      <div>
        <button onClick={() => setShowDynamicUserProfile(true)}>
          Signing as {user.nickname}
        </button>
        <DynamicUserProfile />
      </div>
    );
  }
  return (
    <button
      onClick={() => {
        setShowAuthFlow(true);
      }}
      className="
        flex cursor-pointer flex-row items-center gap-1
        py-5
        uppercase
      "
    >
      <SquareUserRound strokeWidth={1.5} />
    </button>
  );
};
