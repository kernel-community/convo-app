import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";
import { useState } from "react";
import type { EventsRequest } from "src/types";
import { useUser } from "src/context/UserContext";
import Button from "src/components/Button";

const Archive: NextPage = () => {
  const [filterObject, setFilterObject] =
    useState<EventsRequest["filter"]>(undefined);
  const { fetchedUser: user } = useUser();

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
              text-5xl
              font-bold
              lowercase
              text-primary
              lg:py-5
            "
          >
            Archive
          </div>
          <div className="flex flex-row gap-3">
            <Button
              buttonText="by me"
              handleClick={() => {
                return setFilterObject({
                  userId: user.id,
                });
              }}
            />
            <Button
              buttonText="all"
              handleClick={() => {
                return setFilterObject(undefined);
              }}
            />
          </div>
          <Events type="past" take={50} infinite={true} filter={filterObject} />
        </div>
      </Main>
    </>
  );
};
export default Archive;
