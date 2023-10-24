import Link from "next/link";
export const Branding = () => {
  return (
    <Link href="/">
      <div
        className={`
        flex cursor-pointer flex-row items-center gap-3
        py-5 uppercase
        `}
      >
        convo
      </div>
    </Link>
  );
};
