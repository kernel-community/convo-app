import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";

const All: NextPage = () => {
  return (
    <>
      <Main>
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div
            className="
              font-heading
              text-5xl
              font-bold
              lowercase
              text-primary
              lg:py-5
            "
          >
            all upcoming
          </div>
          <Events type="upcoming" take={50} infinite={true} />
        </div>
      </Main>
    </>
  );
};
export default All;
