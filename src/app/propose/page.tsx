"use client";

import type { NextPage } from "next";
import ProposeForm from "src/components/ProposeForm";
import Main from "src/layouts/Main";
const Home: NextPage = () => {
  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div
            className="
            dark:text-primary-dark
            mx-auto
            font-primary
            text-5xl
            font-semibold text-primary
            sm:text-5xl
          "
          >
            Propose a Conversation
          </div>
          <div className="dark:border-primary-dark my-12 w-full border border-primary lg:w-9/12"></div>
        </div>
        <ProposeForm />
      </Main>
    </>
  );
};
export default Home;
