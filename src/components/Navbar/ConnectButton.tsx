import { DynamicUserProfile, useDynamicContext } from "@dynamic-labs/sdk-react";
import { SquareUserRound, UserCircle2 } from "lucide-react";
import { useUser } from "src/context/UserContext";
import { useMediaQuery } from "src/hooks/useMediaQuery";
const desktop = "(min-width: 768px)";
export const ConnectButton = () => {
  const isDesktop = useMediaQuery(desktop);
  const { fetchedUser: user } = useUser();
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();
  if (user.isSignedIn && isDesktop) {
    // display user profile
    return (
      <div>
        <button onClick={() => setShowDynamicUserProfile(true)}>
          <span className="text-slate-400">Signing as</span>{" "}
          <span className="text-slate-200">{user.nickname}</span>
        </button>
        <DynamicUserProfile />
      </div>
    );
  }
  if (user.isSignedIn && !isDesktop) {
    return (
      <div>
        <button
          onClick={() => setShowDynamicUserProfile(true)}
          className="
        flex cursor-pointer flex-row items-center gap-1
        py-5
        uppercase
      "
        >
          <UserCircle2 strokeWidth={1.5} />
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
      <UserCircle2 strokeWidth={1.5} />
    </button>
  );
};
