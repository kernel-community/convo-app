import { Dot } from "lucide-react";
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
        <div className="inline-flex flex-row items-center">
          <Branding />
          <span className="ml-2 hidden sm:block">
            <div className="font-base inline-flex flex-row items-center font-bitter italic text-slate-500">
              Share stories <Dot /> remember memories <Dot /> explore ideas{" "}
              <Dot /> learn together
            </div>
          </span>
        </div>
        <div className="inline-flex flex-row items-center gap-4">
          <Items />
          <ConnectButton />
        </div>
      </div>
    </>
  );
};
