import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";

const Archive: NextPage = () => {
  return (
    <>
      <Main>
        <div
          className="
          px-6
          md:px-12
          lg:px-32
        "
        >
          <div
            className="
              font-heading
              text-4xl
              font-bold
              lowercase
              text-primary
              sm:text-5xl
              lg:py-5
            "
          >
            Archive
          </div>
        </div>
        <Events type="past" take={50} infinite={true} showFilterPanel />
      </Main>
    </>
  );
};
export default Archive;
