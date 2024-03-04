import Link from "next/link";
import { Fragment } from "react";
import useCurrentCommunity from "src/hooks/useCurrentCommunity";
export const Branding = () => {
  const { data: community } = useCurrentCommunity();

  return (
    <div
      className={`
        flex cursor-pointer flex-row items-center gap-2 font-heading text-xl capitalize
        `}
    >
      <Link href="/">convo.</Link>
      {community && (
        <Fragment>
          <a
            // href="https://www.shefi.org/"
            target="_blank"
            rel="noreferrer"
            className="font-bitter text-xs font-medium normal-case italic text-slate-400/80 hover:text-slate-400/100"
          >
            for {community.displayName}
          </a>
        </Fragment>
      )}
    </div>
  );
};
