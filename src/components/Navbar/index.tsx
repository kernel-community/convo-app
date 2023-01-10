import {Item} from "./Item";
import {Branding} from "./Branding";
import Image from "next/image";
import menu from "public/vectors/menu.png";
import {useState} from "react";
export const Navbar = () => {
  const [active, setActive] = useState<boolean>(false);
  const openMenu = () => setActive(!active);
  return (
    <>
      <div className={`
        hidden
        sm:flex
        w-full flex-row gap-8 justify-center items-center bg-kernel
        font-secondary text-sm text-gray-300
        px-3
        shadow-dark
        z-10
      `}>
        <Branding />
        <div className="flex-grow flex flex-row gap-8 items-center justify-center">
          <Item text='home' href='/'/>
          <Item text='all' href='/all'/>
          <Item text='archive' href='/archive'/>
          <Item text='about' href='/about'/>
        </div>
        <Item text='propose' href='/propose'/>
      </div>
      <div className={`
        flex
        sm:hidden
        w-full flex-row gap-8 items-center bg-kernel
        font-secondary text-sm text-gray-300
        px-3
        shadow-dark
        z-10
        justify-between
      `}>
        <Branding />
        <div>
          <Image src={menu} height={27} width={27} onClick={openMenu} alt={""}/>
        </div>
        {/*
          @todo: This mobile nav transition is probably a hack, not sure if this is the best way to achieve it
        */}
        <div className={`
            fixed
            inset-y-0
            left-0
            sm:hidden
            block
            w-64
            bg-kernel
            text-primary-muted
            min-h-screen
            transform
            ${active ? "" : "-translate-x-full"}
            sm:translate-x-0
            transition
            duration-200
            ease-in-out
            p-4
          `}>
          <Item text='home' href='/'/>
          <Item text='all' href='/all'/>
          <Item text='archive' href='/archive'/>
          <Item text='propose' href='/propose'/>
          <Item text='about' href='/about'/>
        </div>
      </div>
    </>
  );
};
