import type { NextPage } from "next";
import Main from "src/layouts/Main";
import Link from "next/link";
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
              font-heading
              text-5xl
              font-bold text-primary
              lg:py-5
              lg:text-7xl
            "
          >
            Convo.
          </div>
          <div
            className="
                pt-12
                font-secondary
                text-lg
                text-kernel
              "
          >
            {/* Spark a thought,&nbsp; */}
            <Link href="/propose">
              <span className="relative inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight">
                <span className="relative text-primary">
                  <span className="underline decoration-dotted">
                    Start a Convo
                  </span>
                  .
                </span>
              </span>
            </Link>
            &nbsp;Make a Friend.
          </div>
        </div>
      </Main>
    </>
  );
};
export default Home;
