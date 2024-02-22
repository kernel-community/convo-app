import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";

const iconStyle = "w-5 h-5";

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

export const Items = () => {
  const { pathname } = useRouter();
  const isActive = (path: string) => pathname === path;
  return (
    <div className="flex flex-row items-center gap-3">
      {items.map((item, index) => (
        <Fragment key={index}>
          <Link href={item.href}>
            <span
              className={`inline-flex cursor-pointer flex-row items-center gap-2 text-sm font-light lowercase text-slate-400
                    ${
                      isActive(item.href)
                        ? "rounded-full bg-zinc-600/50 px-[0.7rem] py-[0.3rem] text-slate-200"
                        : "bg-transparent"
                    }
                    `}
            >
              {item.icon}
              {isActive(item.href) && item.text}
            </span>
          </Link>
        </Fragment>
      ))}
    </div>
  );
};
