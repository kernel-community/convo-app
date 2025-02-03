"use client";

import type { NextPage } from "next";
import ProposeForm from "src/components/ProposeForm";
import Main from "src/layouts/Main";
const Home: NextPage = () => {
  return (
    <>
      <Main className="mx-auto sm:container">
        <div className="flex flex-col items-center justify-center">
          <div
            className="
            mx-auto
            px-8
            font-heading
            text-5xl
            font-extrabold
            text-primary dark:text-primary-dark
            sm:text-5xl
          "
          >
            Propose a Conversation
          </div>
          <div className="my-12 w-full border border-primary dark:border-primary-dark lg:w-9/12"></div>
        </div>
        <ProposeForm />
      </Main>
    </>
  );
};
export default Home;
