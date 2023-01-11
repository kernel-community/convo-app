import { Title } from "./Title";
import { Card } from "./Card";
import { useEffect } from "react";
import type { ClientEvent } from "src/types";
import Link from "next/link";
import { useInfiniteQuery } from "react-query";
import { useInView } from "react-intersection-observer";

/**
 * @todo: change this on the backend - merge the two types
 * Only fetch types 1 (junto) and 2 (guild)
 */
const types = "1,2";

export const Events = ({
  type,
  title,
  highlight,
  take,
  infinite, // to implement or not to implement the infinite scroll
}: {
  type: string;
  title?: string;
  highlight?: string;
  take?: number;
  infinite?: boolean;
}) => {
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
    `events_${type}`,
    async ({ pageParam = "" }) => {
      const r = await (
        await fetch("api/getEvents", {
          body: JSON.stringify({
            type,
            now: new Date(),
            take,
            fromId: pageParam,
            types,
          }),
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
      <div className="sm:flex sm:flex-row sm:flex-wrap sm:gap-4">
        {data &&
          data.pages.map((page) =>
            page.data.map((u: ClientEvent, k: any) => {
              return (
                <Link href={`/rsvp/${u.hash}`} key={k}>
                  <div>
                    <Card
                      title={u.title}
                      descriptionText={u.descriptionHtml ?? ""}
                      startDateTime={u.startDateTime}
                      RSVP={u.totalUniqueRsvps}
                      limit={u.limit}
                      hash={u.hash}
                      type={u.type}
                      by={u.proposer.username || "anonymous"}
                    />
                  </div>
                </Link>
              );
            })
          )}
        {
          // @todo
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
          isLoading || (isFetching && <div></div>)
        }
        {isError && <div>There was an error in fetching</div>}
        {isFetchingNextPage && <div></div>}
      </div>
      {infinite === true && (
        <div ref={ref} className="invisible">
          Intersection Observer Marker
        </div>
      )}
    </div>
  );
};
