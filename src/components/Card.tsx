import { DateTime as DT } from "luxon";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Article } from "./Article";
import { Skeleton } from "./ui/skeleton";
import { ClientEvent } from "src/types";
import { WhoElseIsGoing } from "./Hero";

export const CardTemplate = ({
  children,
  isLoading = false,
}: {
  children?: ReactNode;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Skeleton
        className={`
          h-[100px]
          cursor-pointer
          rounded-bl-[2rem] rounded-br-[2rem] rounded-tl-[2rem] rounded-tr-[2rem] border-2 border-transparent bg-primary-muted
        `}
      />
    );
  }

  return (
    <div
      className={`
        flex
        h-full
        cursor-pointer
        flex-col
        text-secondary-foreground
      `}
    >
      {children}
    </div>
  );
};

export const Card = ({ event }: { event: ClientEvent }) => {
  const [prettyDate, setPrettyDate] = useState<{
    date: string;
    month: string;
    time: string;
  }>({
    date: DT.now().toFormat("dd"),
    month: DT.now().toFormat("LLL"),
    time: DT.now().toFormat("hh:mm a"),
  });
  // We no longer need the isPast state since we're not using it in the UI
  const [seats, setSeats] = useState<{
    available: number;
    total: number;
  }>({
    available: 0,
    total: 0,
  });

  useEffect(() => {
    if (!event.startDateTime) return;
    const d = DT.fromISO(event.startDateTime);
    setPrettyDate({
      date: d.toFormat("dd"),
      month: d.toFormat("LLL"),
      time: d.toFormat("hh:mm a"),
    });
    // We no longer need to set isPast since we removed that state
  }, [event.startDateTime]);

  useEffect(() => {
    if (event.limit === 0) {
      setSeats({
        available: 0,
        total: 0,
      });
    }

    setSeats({
      available: Number(event.limit) - Number(event.totalUniqueRsvps),
      total: Number(event.limit),
    });
  }, [event.limit, event.totalUniqueRsvps]);
  const isSeries = !!event.recurrenceRule;
  return (
    <CardTemplate>
      <div className="flex h-full w-full grow flex-col justify-between rounded-[1rem] border-2 border-transparent bg-secondary-muted p-4 font-secondary text-secondary-foreground transition-all duration-200 ease-in-out hover:border-2 hover:border-secondary">
        <div className="flex flex-col justify-start">
          <div
            className="
              text-lg
              sm:text-xl
            "
          >
            {event.title.replace(/\s/g, "").length < 40
              ? event.title
              : event.title.substring(0, 40) + "..."}
          </div>
          <div className="text-xxs sm:text-xs">
            {event.nickname || "anonymous"}
          </div>
        </div>
        <div className="my-4 flex grow flex-row items-center text-sm">
          <Article
            html={
              event.descriptionHtml &&
              (event.descriptionHtml?.length > 100
                ? event.descriptionHtml?.substring(0, 80) + "..."
                : event.descriptionHtml)
            }
            card
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-1">
            {/* Display RSVPs (if 2 or more) or available seats */}
            {event.totalUniqueRsvps >= 2 ? (
              <div className="text-xs font-thin">
                {event.totalUniqueRsvps} people going
              </div>
            ) : (
              seats.total > 0 && (
                <div className="text-xs font-thin">
                  {seats.available} {seats.available === 1 ? "seat" : "seats"}{" "}
                  available
                </div>
              )
            )}

            {/* Display recurring event info */}
            {isSeries && (
              <div className="text-xxs font-thin">Is a recurring event</div>
            )}
          </div>
        </div>
      </div>
    </CardTemplate>
  );
};
