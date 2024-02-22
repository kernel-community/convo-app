import type { NextPage } from "next";
import Main from "src/layouts/Main";
import Link from "next/link";
import { Events } from "src/components/Events";
import type { ReactNode } from "react";
import { Button } from "src/components/ui/button";
const Home: NextPage = () => {
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
            Convo
          </div>
          <div
            className="
                ml-2
                pt-3
                font-secondary
                text-lg
                text-kernel
              "
          >
            Why are we alive, if not to
            <Link href="/propose">
              <FancyHighlight>
                <span className="cursor-pointer">make connections?</span>
              </FancyHighlight>
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-6 lg:px-32 xl:px-40 2xl:px-52">
          <div className="mt-12">
            <Events type="month" highlight="next 28 days" take={6} />
          </div>
          <Link href={"/all"} className="self-center">
            <Button>See all Convos</Button>
          </Link>
        </div>
      </Main>
    </>
  );
};

export const FancyHighlight = ({ children }: { children: ReactNode }) => {
  return (
    <span className="relative ml-2 mt-2 inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight">
      <span className="relative text-primary">{children}</span>
    </span>
  );
};
export default Home;
