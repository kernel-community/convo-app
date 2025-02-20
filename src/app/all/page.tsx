"use client";

import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";

const All: NextPage = () => {
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
              dark:text-primary-dark
              font-primary
              text-4xl
              lowercase text-primary
              sm:text-5xl
              lg:py-5
            "
          >
            all upcoming
          </div>
          <Events
            type={"upcoming"}
            take={50}
            infinite={true}
            showFilterPanel
            useDynamicLayout={true}
          />
        </div>
      </Main>
    </>
  );
};
export default All;
