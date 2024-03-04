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
          <span className="text-slate-400/80 hover:text-slate-400/100">|</span>
          <a
            target="_blank"
            rel="noreferrer"
            className="font-secondary text-xs normal-case text-slate-400/80 hover:text-slate-400/100"
          >
            for {community.displayName}
          </a>
        </Fragment>
      )}
    </div>
  );
};
