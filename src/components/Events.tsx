import { Title } from "./Title";
import { Card, CardTemplate } from "./Card";
import type { Key } from "react";
import { useEffect } from "react";
import type { ClientEvent } from "src/types";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import { useUser } from "src/context/UserContext";
import { useState } from "react";
import type { EventsRequest } from "src/types";
import Link from "next/link";
import { DateTime } from "luxon";
import _ from "lodash";

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
      refetchInterval: 143460000, // every minute
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
      enabled: mounted,
    }
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const displayLoadingState =
    isLoading || !mounted || !data || isFetching || isFetchingNextPage;

  const Loading = () => {
    return (
      <div className="flex flex-col gap-2">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <CardTemplate key={i} isLoading={true} />
          ))}
      </div>
    );
  };
  const groupEventsByDay = (pages: { data: ClientEvent[] }[]) => {
    // Flatten all pages of events into a single array
    const allEvents = pages.flatMap((page) => page.data);

    // Group events by day
    const groupedEvents = _.groupBy(allEvents, (event) =>
      DateTime.fromJSDate(new Date(event.startDateTime)).startOf("day").toISO()
    );

    // Sort the dates chronologically
    return Object.entries(groupedEvents).sort(
      ([dateA], [dateB]) =>
        DateTime.fromISO(dateA).toMillis() - DateTime.fromISO(dateB).toMillis()
    );
  };

  return (
    <>
      {title && <Title text={title} highlight={highlight} className="mb-3" />}
      {user?.isSignedIn && showFilterPanel && (
        <div className="my-4 flex flex-row gap-12">
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
      {displayLoadingState && <Loading />}
      {!displayLoadingState && data && (
        <div className="flex flex-col gap-6">
          {data.pages[0].data.length === 0 ? (
            <div className="font-primary lowercase">
              no events to display here
            </div>
          ) : (
            groupEventsByDay(data.pages).map(([date, events]) => (
              <div key={date} className="flex flex-col gap-2">
                <h3 className="font-primary text-lg text-gray-600">
                  {DateTime.fromISO(date).toLocaleString({
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                {events.map((event: ClientEvent, k: Key) => (
                  <Link href={`/rsvp/${event.hash}`} key={k} className="w-full">
                    <Card event={event} />
                  </Link>
                ))}
              </div>
            ))
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
    </>
  );
};
