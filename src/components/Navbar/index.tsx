"use client";
import { Branding } from "./Branding";
import { ConnectButton } from "./ConnectButton";
import { Items } from "./Items";
import ThemeSwitcher from "./ThemeSwitcher";
import { useMediaQuery } from "src/hooks/useMediaQuery";
const desktop = "(min-width: 768px)";

export const Navbar = () => {
  const isDesktop = useMediaQuery(desktop);

  return (
    <>
      <div
        className={`
          z-10
          flex w-full flex-row items-center justify-between gap-8
          p-3 font-secondary
        `}
      >
        <div className="inline-flex flex-row items-center">
          <Branding />
          {/* <ThemeSwitcher /> */}

          {/* <span className="ml-2 hidden sm:block">
            <div className="font-base inline-flex cursor-pointer flex-row items-center font-bitter italic text-slate-700">
              <span className="hover:text-slate-500">share stories</span>
              <Dot />
              <span className="hover:text-slate-500">remember memories</span>
              <Dot />
              <span className="hover:text-slate-500">explore ideas</span>{" "}
              <Dot />
              <span className="hover:text-slate-500">learn together</span>
            </div>
          </span> */}
        </div>
        <div className="inline-flex flex-row items-center gap-4">
          {/* <Items /> */}
          <ConnectButton />
        </div>
      </div>
    </>
  );
};
