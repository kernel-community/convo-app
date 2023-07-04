import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";
import { useState } from "react";
import { EventsRequest } from "src/types";
import Button from "src/components/Button";
import { useUser } from "src/context/UserContext";

const All: NextPage = () => {
  const [filterObject, setFilterObject] =
    useState<EventsRequest["filter"]>(undefined);
  const { fetchedUser: user } = useUser();

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

          <Events
            type={"upcoming"}
            take={50}
            infinite={true}
            filter={filterObject}
          />
        </div>
      </Main>
    </>
  );
};
export default All;
