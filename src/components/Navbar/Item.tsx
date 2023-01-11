import { useRouter } from "next/router";
import Link from "next/link";
export const Item = ({ text, href }: { text: string; href: string }) => {
  const { pathname } = useRouter();
  return (
    <Link href={href}>
      <div
        className={`
        flex cursor-pointer flex-row items-center gap-1
        py-5
        lowercase
        ${pathname == href ? "border-b-2 border-primary-muted" : "opacity-50"}
        `}
      >
        {text}
      </div>
    </Link>
  );
};
