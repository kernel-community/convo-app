import { Title } from "./Title";
import { Card } from "./Card";
import type { Key } from "react";
import { useEffect } from "react";
import type { ClientEvent } from "src/types";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import { useUser } from "src/context/UserContext";
import { useState } from "react";
import type { EventsRequest } from "src/types";
import EventLoadingState from "./LoadingState/SingleEvent";

const FilterButton = ({
  onClick,
  text,
  active,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  text: string;
  active: boolean;
}) => {
  return (
    <div
      className={`cursor-pointer font-secondary ${
        active ? "border-spacing-4 border-b-2 border-black" : ""
      }`}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export const Events = ({
  type,
  title,
  highlight,
  take,
  infinite = false, // to implement or not to implement the infinite scroll
  showFilterPanel = false, // only works when user logged in
  preFilterObject,
}: Pick<EventsRequest, "type"> & {
  title?: string;
  highlight?: string;
  take?: number;
  infinite?: boolean;
  showFilterPanel?: boolean;
  preFilterObject?: EventsRequest["filter"];
}) => {
  const { fetchedUser: user } = useUser();
  const [filterObject, setFilterObject] =
    useState<EventsRequest["filter"]>(preFilterObject);
  const { ref, inView } = useInView();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isLoading,
    isError,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    `events_${type}_${JSON.stringify(filterObject)}`,
    async ({ pageParam = "" }) => {
      const requestObject: EventsRequest = {
        type,
        now: new Date(),
        take,
        fromId: pageParam,
        filter: filterObject,
      };
      const r = await (
        await fetch(`/api/query/getEvents`, {
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
      refetchInterval: 60000,
      enabled: mounted,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!mounted) {
    return (
      <div>
        <Title text={title} highlight={highlight} className="mb-3" />
        <div className="flex flex-col gap-4 py-3 sm:flex-row sm:flex-wrap">
          <EventLoadingState />
          <EventLoadingState />
          <EventLoadingState />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title text={title} highlight={highlight} className="mb-3" />
      {user?.isSignedIn && showFilterPanel && (
        <div className="my-8 flex flex-row gap-12">
          <FilterButton
            text="all"
            onClick={() => setFilterObject(undefined)}
            active={!filterObject}
          />
          <FilterButton
            text="by me"
            onClick={() => setFilterObject({ proposerId: user.id })}
            active={!!filterObject?.proposerId}
          />
          <FilterButton
            text="my rsvps"
            onClick={() =>
              setFilterObject({ proposerId: undefined, rsvpUserId: user.id })
            }
            active={!!filterObject?.rsvpUserId}
          />
        </div>
      )}

      {(!data || isLoading || isFetching) && (
        <div className="flex flex-col gap-4 py-3 sm:flex-row sm:flex-wrap">
          <EventLoadingState />
          <EventLoadingState />
          <EventLoadingState />
        </div>
      )}

      {data && !isLoading && !isFetching && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {data.pages.map((page) =>
            page.data.map((u: ClientEvent, k: Key) => (
              <a href={`/rsvp/${u.hash}`} key={k}>
                <Card
                  title={u.title}
                  description={u.descriptionHtml ?? ""}
                  startDateTime={u.startDateTime}
                  RSVP={u.totalUniqueRsvps}
                  limit={u.limit}
                  by={u.nickname || "anonymous"}
                  isSeries={u.series}
                />
              </a>
            ))
          )}
          {data.pages[0].data.length === 0 && (
            <div className="font-primary lowercase">
              no events to display here
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="text-red-500">There was an error fetching events</div>
      )}

      {infinite && (
        <div ref={ref} className="invisible">
          Intersection Observer Marker
        </div>
      )}
    </div>
  );
};
