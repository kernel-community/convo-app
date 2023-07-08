import type { NextPage } from "next";
import Main from "src/layouts/Main";
import Link from "next/link";
import { Events } from "src/components/Events";
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
          <div
            className="
                pt-12
                font-secondary
                text-lg
                text-kernel
              "
          >
            Wander off in a&nbsp;
          </div>
          <Link href="/propose">
            <span className="relative mt-2 inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight">
              <div
                className="
              relative
              font-heading
              text-5xl font-bold
              text-primary
              lg:text-7xl
            "
              >
                Convo.
              </div>
            </span>
          </Link>
        </div>
        <div className="mt-12 px-12 lg:px-32 xl:px-40 2xl:px-52">
          <div className="mt-12">
            <Events type="live" highlight="Live" take={6} />
          </div>
          <div className="mt-12">
            <Events type="today" title="upcoming" highlight="today" take={6} />
          </div>
          <div className="mt-12">
            <Events type="week" highlight="next 7 days" take={6} />
          </div>
        </div>
      </Main>
    </>
  );
};
export default Home;
