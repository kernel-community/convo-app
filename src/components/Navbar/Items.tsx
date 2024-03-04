import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  HomeIcon,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerTrigger } from "src/components/ui/drawer";
import { ConnectButton } from "./ConnectButton";

const iconStyle = "w-4 h-4";

const items = [
  {
    icon: <HomeIcon className={iconStyle} strokeWidth={1.5} />,
    text: "home",
    href: "/",
  },
  {
    icon: <CalendarDays className={iconStyle} strokeWidth={1.5} />,
    text: "all",
    href: "/all",
  },
  {
    icon: <CalendarClock className={iconStyle} strokeWidth={1.5} />,
    text: "archive",
    href: "/archive",
  },
  {
    icon: <CalendarPlus className={iconStyle} strokeWidth={1.5} />,
    text: "propose",
    href: "/propose",
  },
];
const desktop = "(min-width: 768px)";

export const Items = () => {
  const { pathname } = useRouter();
  const isActive = (path: string) => pathname === path;
  const isDesktop = useMediaQuery(desktop);
  if (isDesktop) {
    return (
      <div className="flex flex-row items-center gap-3">
        {items.map((item, index) => (
          <Fragment key={index}>
            <Link href={item.href}>
              <span
                className={`group inline-flex cursor-pointer flex-row items-center gap-2 rounded-full bg-zinc-600/50 px-[0.7rem]
                py-[0.3rem] text-sm font-light lowercase text-slate-400
                    ${isActive(item.href) && "bg-zinc-600/80 !text-slate-200"}
                  `}
              >
                {item.icon}
                {!isActive(item.href) && (
                  <span className="hidden group-hover:block">{item.text}</span>
                )}
                {isActive(item.href) && item.text}
              </span>
            </Link>
          </Fragment>
        ))}
      </div>
    );
  }
  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <Menu />
      </DrawerTrigger>
      <DrawerContent className="rounded-none left-24 h-full rounded-l-lg">
        <div className="flex flex-col gap-3 p-3">
          {items.map((item, index) => (
            <Fragment key={index}>
              <Link href={item.href}>
                <span
                  className={`group inline-flex cursor-pointer flex-row items-center gap-2 text-sm font-light lowercase text-black
                ${isActive(item.href) ? `border-b-2 border-black` : ``}
                `}
                >
                  {item.icon}
                  <span className="">{item.text}</span>
                </span>
              </Link>
            </Fragment>
          ))}
          <ConnectButton />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
