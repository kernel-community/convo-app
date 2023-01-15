import { Item } from "./Item";
import { Branding } from "./Branding";
import Image from "next/image";
import menu from "public/vectors/menu.png";
import { useState } from "react";
import LoginButton from "../LoginButton";

export const Navbar = () => {
  const [active, setActive] = useState<boolean>(false);
  const openMenu = () => setActive(!active);
  return (
    <>
      <div
        className={`
        z-10
        hidden
        w-full flex-row items-center justify-center gap-8 bg-kernel
        px-3 font-secondary text-sm
        text-gray-300
        shadow-dark
        sm:flex
      `}
      >
        <Branding />
        <div className="flex flex-grow flex-row items-center justify-center gap-8">
          <Item text="home" href="/" />
          <Item text="all" href="/all" />
          <Item text="archive" href="/archive" />
          <Item text="about" href="/about" />
        </div>
        {/* <Item text="propose" href="/propose" /> */}
        <LoginButton />
      </div>
      <div
        className={`
        z-10
        flex
        w-full flex-row items-center justify-between gap-8
        bg-kernel px-3 font-secondary
        text-sm
        text-gray-300
        shadow-dark
        sm:hidden
      `}
      >
        <Branding />
        <div>
          <Image
            src={menu}
            height={27}
            width={27}
            onClick={openMenu}
            alt={""}
          />
        </div>
        {/*
          @todo: This mobile nav transition is probably a hack, not sure if this is the best way to achieve it
        */}
        <div
          className={`
            fixed
            inset-y-0
            left-0
            block
            min-h-screen
            w-64
            transform
            bg-kernel
            text-primary-muted
            sm:hidden
            ${active ? "" : "-translate-x-full"}
            p-4
            transition
            duration-200
            ease-in-out
            sm:translate-x-0
          `}
        >
          <Item text="home" href="/" />
          <Item text="all" href="/all" />
          <Item text="archive" href="/archive" />
          <Item text="about" href="/about" />
          {/* <Item text="propose" href="/propose" /> */}
          <LoginButton />
        </div>
      </div>
    </>
  );
};
