import type { NextPage } from "next";
import Main from "src/layouts/Main";
import Link from "next/link";
import { Events } from "src/components/Events";
import type { ReactNode } from "react";
const Home: NextPage = () => {
  return (
    <>
      <Main>
        <div
          className="
          pl-12
          md:pl-12
          lg:pl-64
        "
        >
          <Link href="/all">
            <div
              className="
                my-2
                font-heading text-5xl
                font-bold
                lg:text-7xl
              "
            >
              Convo
            </div>
          </Link>
          <div
            className="
                ml-2
                pt-3
                font-secondary
                text-lg
                text-kernel
              "
          >
            Why are we alive, if not to{" "}
            <Link href="/propose">
              <span className="cursor-pointer">make connections?</span>
            </Link>
          </div>
          <div
            className="
            pt-3
            font-secondary
            text-lg
            text-kernel
          "
          >
            <span className="cursor-pointer">
              <FancyHighlight>
                <span className="underline decoration-dashed">
                  <Link href={"/propose"}>Propose a convo</Link>
                </span>
                <span className="">.</span>
              </FancyHighlight>
            </span>
            . Share stories, remember memories, explore ideas, learn together.
          </div>
        </div>
        <div className="mt-12 px-12 lg:px-32 xl:px-40 2xl:px-52">
          {/* <div className="mt-12">
            <Events type="live" highlight="Live" take={6} />
          </div> */}
          {/* <div className="mt-12">
            <Events type="today" title="upcoming" highlight="today" take={6} />
          </div> */}
          <div className="mt-12">
            <Events type="month" highlight="next 28 days" take={6} />
          </div>
        </div>
      </Main>
    </>
  );
};

export const FancyHighlight = ({ children }: { children: ReactNode }) => {
  return (
    <span className="relative ml-2 inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight">
      <span className="relative text-primary">{children}</span>
    </span>
  );
};
export default Home;
