"use client";

import Main from "src/layouts/Main";
import Link from "next/link";
import { Events } from "src/components/Events";
import { Button } from "src/components/ui/button";
import useCurrentCommunity from "src/hooks/useCurrentCommunity";
import { isNil, isUndefined } from "lodash";
import { FancyHighlight } from "src/components/FancyHighlight";

const Home = () => {
  const { data: community } = useCurrentCommunity();
  return (
    <>
      <Main
        linesOverride={true}
        showLines={isUndefined(community) || isNil(community)}
      >
        <div
          className="
          pl-6
          md:pl-6
          lg:pl-64
        "
        >
          <div
            className="
              font-heading text-5xl
              font-bold
              lg:text-7xl
            "
          >
            Convo.
            {/* {community && (
              <span className="font-bitter text-base font-medium italic text-slate-400/80 hover:text-slate-400/100">
                <a
                  // href="https://www.shefi.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  for {community.displayName}
                </a>
              </span>
            )} */}
          </div>
          <div
            className="
                ml-2
                pt-3
                font-secondary
                text-sm
                text-kernel
              "
          >
            <Link href="/propose">
              <FancyHighlight>
                <span className="cursor-pointer">Start a Convo?</span>
              </FancyHighlight>
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-6 px-6 lg:px-32 xl:px-40 2xl:px-52">
          <div className="mt-12">
            <Events
              type="nextTwentyEightDays"
              title="next"
              highlight="28 days"
              take={6}
            />
          </div>
          <Link href={"/all"} className="self-center">
            <Button>See all Convos</Button>
          </Link>
        </div>
      </Main>
    </>
  );
};

export default Home;
