import { Title } from "./Title";
import { Card } from "./Card";
import type { Key } from "react";
import { useEffect } from "react";
import type { ClientEvent } from "src/types";
import Link from "next/link";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import { DateTime } from "luxon";
import Button from "src/components/Button";
import { useUser } from "src/context/UserContext";
import { useState } from "react";
import type { EventsRequest } from "src/types";
export const Events = ({
  type,
  title,
  highlight,
  take,
  infinite, // to implement or not to implement the infinite scroll
  showFilterPanel = false,
}: Pick<EventsRequest, "type"> & {
  title?: string;
  highlight?: string;
  take?: number;
  infinite?: boolean;
  showFilterPanel?: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const [filterObject, setFilterObject] =
    useState<EventsRequest["filter"]>(undefined);
  const { ref, inView } = useInView();
  const {
    isLoading,
    isError,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    `events_${type}_${filterObject}`,
    async ({ pageParam = "" }) => {
      const requestObject: EventsRequest = {
        type,
        now: DateTime.now().toJSDate(),
        take,
        fromId: pageParam,
        filter: filterObject,
      };
      const r = await (
        await fetch("api/query/getEvents", {
          body: JSON.stringify(requestObject),
          method: "POST",
          headers: { "Content-type": "application/json" },
        })
      ).json();
      return r;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextId ?? false;
      },
      refetchInterval: 60000, // refetch every minute
    }
  );
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);
  return (
    <div>
      <Title text={title} highlight={highlight} className="mb-3" />
      {user.isSignedIn && showFilterPanel && (
        <div className="my-3 flex flex-row gap-3">
          <Button
            buttonText="by me"
            handleClick={() => {
              return setFilterObject({
                proposerId: user.id,
              });
            }}
          />
          <Button
            buttonText="all"
            handleClick={() => {
              return setFilterObject(undefined);
            }}
          />
          <Button
            buttonText="my rsvps"
            handleClick={() => {
              return setFilterObject({
                proposerId: undefined,
                rsvpUserId: user.id,
              });
            }}
          />
        </div>
      )}
      <div className="sm:flex sm:flex-row sm:flex-wrap sm:gap-4">
        {data &&
          data.pages.map((page) =>
            page.data.map((u: ClientEvent, k: Key) => {
              return (
                <Link href={`/rsvp/${u.hash}`} key={k}>
                  <div>
                    <Card
                      title={u.title}
                      description={u.descriptionHtml ?? ""}
                      startDateTime={u.startDateTime}
                      RSVP={u.totalUniqueRsvps}
                      limit={u.limit}
                      by={u.nickname || "anonymous"}
                      isSeries={u.series}
                    />
                  </div>
                </Link>
              );
            })
          )}
        {
          // @todo better loading state
          !isLoading &&
            data &&
            data.pages[0].data &&
            data.pages[0].data.length === 0 && (
              <div className="font-primary lowercase">
                no events to display here
              </div>
            )
        }
        {
          // @todo
          isLoading || (isFetching && <div>Loading...</div>)
        }
        {isError && <div>There was an error in fetching</div>}
        {isFetchingNextPage && <div></div>}
      </div>
      {infinite && infinite === true && (
        <div ref={ref} className="invisible">
          Intersection Observer Marker
        </div>
      )}
    </div>
  );
};
