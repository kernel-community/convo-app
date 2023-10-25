import { Branding } from "./Branding";
import { DynamicUserProfile, useDynamicContext } from "@dynamic-labs/sdk-react";
import { useUser } from "src/context/UserContext";

const ConnectButton = () => {
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
      Login
    </button>
  );
};

export const Navbar = () => {
  return (
    <>
      <div
        className={`
          z-10
          flex w-full flex-row items-center justify-between gap-8
          bg-kernel px-3 font-secondary
          text-sm
          text-gray-300
          shadow-dark
        `}
      >
        <Branding />
        <ConnectButton />
      </div>
    </>
  );
};
