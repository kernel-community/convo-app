"use client";

import type { NextPage } from "next";
import { useUser } from "src/context/UserContext";
import Main from "src/layouts/Main";

const Test: NextPage = () => {
  const { fetchedUser: user } = useUser();
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
              Hello{user.isSignedIn && `, ${user.nickname}`}
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default Test;
