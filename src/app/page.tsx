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
      <Main>
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
            Start a
            <Link href={"/propose"}>
              <FancyHighlight className="mx-3">Convo</FancyHighlight>
            </Link>
            .
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
