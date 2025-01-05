import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  HomeIcon,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const isDesktop = useMediaQuery(desktop);
  if (isDesktop) {
    return (
      <div className="flex flex-row gap-1 pt-3">
        {items.map((item, index) => (
          <Fragment key={index}>
            <Link href={item.href}>
              <span
                className={`group inline-flex w-20 cursor-pointer flex-col items-center text-sm lowercase text-slate-200 dark:text-primary-dark`}
              >
                <span className="group-hover:block">{item.text}</span>
                <div
                  className={`mt-3 h-1 w-full self-end rounded-t-sm ${
                    isActive(item.href)
                      ? "bg-white dark:bg-primary-dark"
                      : "bg-transparent"
                  }`}
                />
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
        <Menu className="my-2" />
      </DrawerTrigger>
      <DrawerContent className="rounded-none left-24 h-full rounded-l-lg border-none bg-kernel">
        <div className="flex flex-col gap-3 p-3">
          {items.map((item, index) => (
            <Fragment key={index}>
              <Link href={item.href}>
                <span
                  className={`group inline-flex cursor-pointer flex-row items-center gap-2 text-sm font-light lowercase text-white
                ${isActive(item.href) ? `border-b-2 border-white` : ``}
                `}
                >
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
