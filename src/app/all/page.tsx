"use client";

import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";

const All: NextPage = () => {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";

  return (
    <>
      <CursorsContextProvider host={host} roomId="all">
        <SharedSpace>
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
        </SharedSpace>
      </CursorsContextProvider>
    </>
  );
};
export default All;
