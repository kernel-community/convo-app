import { Branding } from "./Branding";
import { ConnectButton } from "./ConnectButton";
import { Items } from "./Items";

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
        <div className="inline-flex flex-row items-center gap-4">
          <Items />
          <ConnectButton />
        </div>
      </div>
    </>
  );
};
