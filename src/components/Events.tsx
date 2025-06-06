"use client";

import React, { useEffect, useState } from "react";
import type { Key } from "react";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { DateTime } from "luxon";
import _ from "lodash";
import { motion } from "framer-motion";

import { useUser } from "src/context/UserContext";
import { CalendarPopover } from "./CalendarPopover";
import type { ClientEvent, EventsRequest } from "src/types";
import { Title } from "./Title";
import { Card, CardTemplate } from "./Card";

interface DateDisplayProps {
  date: Date | string;
  onDateChange?: (date: Date) => void;
  className?: string;
  eventDates?: Date[];
}

const DateDisplay = ({
  date,
  onDateChange,
  className = "",
  eventDates,
}: DateDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dateTime =
    typeof date === "string"
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date);
  const dateValue = typeof date === "string" ? new Date(date) : date;

  return (
    <CalendarPopover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={(newDate) => {
        onDateChange?.(newDate);
        setIsOpen(false);
      }}
      selectedDate={dateValue}
      eventDates={eventDates}
    >
      <div
        className={`group flex max-w-max cursor-pointer items-start ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative rounded-md rounded-br-[50px] rounded-tl-[50px] bg-primary-muted px-8 py-2 pr-6">
          <h3 className="font-primary text-lg text-foreground underline decoration-dotted underline-offset-4 transition-all md:no-underline md:group-hover:underline">
            {(() => {
              const now = DateTime.now();
              const diff = dateTime
                .startOf("day")
                .diff(now.startOf("day"), "days").days;
              const isWeekend = dateTime.weekday >= 6;
              const isThisWeekend = isWeekend && diff >= 0 && diff <= 2;

              if (diff === 0) return "today";
              if (diff === 1) return "tomorrow";
              if (isThisWeekend) return "this weekend";

              const isMobile =
                typeof window !== "undefined" &&
                window.matchMedia("(max-width: 767px)").matches;
              return dateTime.toLocaleString({
                weekday: isMobile ? "short" : "long",
                month: isMobile ? "short" : "long",
                day: "numeric",
                year: "numeric",
              });
            })()}
          </h3>
        </div>
      </div>
    </CalendarPopover>
  );
};

const FilterButton = ({
  onClick,
  text,
  active,
}: {
  onClick: () => void;
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
  useDynamicLayout = false,
}: Pick<EventsRequest, "type"> & {
  title?: string;
  highlight?: string;
  take?: number;
  infinite?: boolean;
  showFilterPanel?: boolean;
  preFilterObject?: EventsRequest["filter"];
  useDynamicLayout?: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const [filterObject, setFilterObject] =
    useState<EventsRequest["filter"]>(preFilterObject);
  const { ref, inView } = useInView();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Update filter when preFilterObject changes to ensure it's always current
  useEffect(() => {
    setFilterObject(preFilterObject);
  }, [preFilterObject]);

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
      // When a specific user's events are requested, just pass that filter directly
      // without mixing in the current user's filters
      let requestFilter = filterObject;

      // Only apply user-specific filters when no specific user is already specified
      if (
        !filterObject?.userId &&
        user?.isSignedIn &&
        filterObject?.proposerId
      ) {
        // This is the "by me" filter for the currently logged-in user
        requestFilter = {
          proposerId: user.id,
        };
      } else if (
        !filterObject?.userId &&
        user?.isSignedIn &&
        filterObject?.rsvpUserId
      ) {
        // This is the "my rsvps" filter for the currently logged-in user
        requestFilter = {
          rsvpUserId: user.id,
        };
      } else if (filterObject?.userId) {
        // For a specific user view, pass the filter unchanged
        requestFilter = {
          userId: filterObject.userId,
          nickname: filterObject.nickname,
        };
      }

      const requestObject: EventsRequest = {
        type,
        now: new Date(),
        take,
        fromId: pageParam,
        filter: requestFilter,
      };

      console.log(
        "Fetching events with filter:",
        JSON.stringify(requestFilter)
      );

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

  // Clear any filters when switching between filter types to avoid mixed results
  const handleFilterChange = (newFilter: EventsRequest["filter"]) => {
    // Ensure we completely replace the filter object to avoid merging properties
    setFilterObject(newFilter);
  };

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
  const groupEventsByDay = React.useMemo(() => {
    return (pages: { data: ClientEvent[] }[]) => {
      // Defensive check: filter out pages that don't have data (error responses)
      const validPages = pages.filter(
        (page) => page && page.data && Array.isArray(page.data)
      );

      if (validPages.length === 0) {
        return [];
      }

      // Flatten all pages of events into a single array
      const allEvents = validPages.flatMap((page) => page.data);

      // Pre-process dates once
      const eventsWithProcessedDates = allEvents.map((event) => ({
        ...event,
        dayKey: DateTime.fromJSDate(new Date(event.startDateTime))
          .startOf("day")
          .toISO(),
      }));

      // Group events by day
      const groupedEvents = _.groupBy(eventsWithProcessedDates, "dayKey");

      // Sort the date groups - the events are already sorted by the API
      // Just maintain the same date ordering logic (chronological vs reverse chronological)
      return Object.entries(groupedEvents).sort(([dateA], [dateB]) => {
        const dateAMillis = DateTime.fromISO(dateA).toMillis();
        const dateBMillis = DateTime.fromISO(dateB).toMillis();

        // If type is "past", reverse the order (newest first)
        if (type === "past") {
          return dateBMillis - dateAMillis;
        }
        // Otherwise, keep chronological order (oldest first)
        return dateAMillis - dateBMillis;
      });
    };
  }, [type]); // Add type as a dependency since we use it in the sorting logic

  // Helper function to safely check if we have valid data
  const hasValidData =
    data &&
    data.pages &&
    data.pages.length > 0 &&
    data.pages[0] &&
    data.pages[0].data &&
    Array.isArray(data.pages[0].data);

  return (
    <>
      {title && <Title text={title} highlight={highlight} className="mb-3" />}

      {user?.isSignedIn && showFilterPanel && (
        <div className="my-4 flex flex-row gap-12">
          <FilterButton
            text="all"
            onClick={() => handleFilterChange(undefined)}
            active={
              !filterObject ||
              !!(filterObject?.userId && filterObject?.nickname)
            }
          />
          <FilterButton
            text="by me"
            onClick={() => handleFilterChange({ proposerId: user.id })}
            active={!!filterObject?.proposerId}
          />
          <FilterButton
            text="my rsvps"
            onClick={() =>
              handleFilterChange({ proposerId: undefined, rsvpUserId: user.id })
            }
            active={!!filterObject?.rsvpUserId}
          />
        </div>
      )}
      {displayLoadingState && <Loading />}
      {!displayLoadingState && data && (
        <div className="flex flex-col gap-6">
          {!hasValidData ? (
            <div className="font-primary lowercase">
              no events to display here
            </div>
          ) : data.pages[0].data.length === 0 ? (
            <div className="font-primary lowercase">
              no events to display here
            </div>
          ) : (
            <>
              {selectedDate ? (
                <motion.div
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <DateDisplay
                      date={selectedDate}
                      onDateChange={setSelectedDate}
                      eventDates={data?.pages.flatMap((page) =>
                        page && page.data && Array.isArray(page.data)
                          ? page.data.map(
                              (event: {
                                startDateTime: string | number | Date;
                              }) => new Date(event.startDateTime)
                            )
                          : []
                      )}
                    />
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="rounded-md px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                    >
                      View all
                    </button>
                  </div>
                  {groupEventsByDay(data.pages)
                    .filter(([date]) =>
                      DateTime.fromISO(date).hasSame(
                        DateTime.fromJSDate(selectedDate),
                        "day"
                      )
                    )
                    .map(([date, events]) => {
                      return (
                        <div
                          key={date}
                          className={`${
                            useDynamicLayout && events.length > 2
                              ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                              : "flex flex-col gap-2"
                          }`}
                        >
                          {events.map((event: ClientEvent, k: Key) => (
                            <Link
                              href={`/rsvp/${event.hash}`}
                              key={k}
                              className="h-full w-full"
                            >
                              <Card event={event} />
                            </Link>
                          ))}
                        </div>
                      );
                    })}
                  {groupEventsByDay(data.pages).filter(([date]) =>
                    DateTime.fromISO(date).hasSame(
                      DateTime.fromJSDate(selectedDate),
                      "day"
                    )
                  ).length === 0 && (
                    <div className="py-8 text-center font-primary text-gray-600">
                      No Convos scheduled
                    </div>
                  )}
                </motion.div>
              ) : (
                groupEventsByDay(data.pages).map(([date, events]) => {
                  return (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2"
                    >
                      <DateDisplay
                        date={date}
                        onDateChange={(newDate) => setSelectedDate(newDate)}
                        eventDates={data?.pages.flatMap((page) =>
                          page && page.data && Array.isArray(page.data)
                            ? page.data.map(
                                (event: {
                                  startDateTime: string | number | Date;
                                }) => new Date(event.startDateTime)
                              )
                            : []
                        )}
                      />
                      <div
                        className={`${
                          useDynamicLayout && events.length > 2
                            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col gap-2"
                        }`}
                      >
                        {events.map((event: ClientEvent, k: Key) => (
                          <Link
                            href={`/rsvp/${event.hash}`}
                            key={k}
                            className="h-full w-full"
                          >
                            <Card event={event} />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </>
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
