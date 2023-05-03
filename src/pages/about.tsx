import type { NextPage } from "next";
import Main from "src/layouts/Main";

const About: NextPage = () => {
  return (
    <>
      <Main className="mx-auto px-4">
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="
            mx-auto
            font-heading
            text-4xl
            font-extrabold
            text-primary
            sm:text-4xl
          "
            >
              Why are we alive, if not to make connnections?
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default About;
