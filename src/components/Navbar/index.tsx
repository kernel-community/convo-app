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
            <div className="font-base inline-flex cursor-pointer flex-row items-center font-bitter italic text-slate-700">
              <span className="hover:text-slate-500">share stories</span>
              <Dot />
              <span className="hover:text-slate-500">remember memories</span>
              <Dot />
              <span className="hover:text-slate-500">explore ideas</span>{" "}
              <Dot />
              <span className="hover:text-slate-500">learn together</span>
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
