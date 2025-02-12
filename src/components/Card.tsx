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
          rounded-bl-[2rem] rounded-br-[2rem] rounded-tl-[2rem] rounded-tr-[2rem] border border-2 border-transparent bg-primary-muted
        `}
      />
    );
  }

  return (
    <div
      className={`
        flex
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
  const [isPast, setIsPast] = useState<boolean>(false);
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
    if (d.diffNow().milliseconds < 0) setIsPast(true);
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
      <div className="flex w-full flex-row rounded-bl-[1rem] rounded-br-[2rem] rounded-tl-[1rem] rounded-tr-[2rem] border border-2 border-transparent bg-primary-muted transition-all duration-200 ease-in-out hover:border-2 hover:border-secondary sm:rounded-bl-[2rem] sm:rounded-tl-[2rem] ">
        <div className="w-2/5 rounded-bl-[1rem] rounded-br-[2rem] rounded-tl-[1rem] rounded-tr-[2rem] bg-primary-muted p-2 text-foreground sm:w-1/5 sm:rounded-bl-[2rem] sm:rounded-tl-[2rem] sm:p-4">
          <div className="flex flex-col items-start font-secondary">
            <div className="flex flex-row items-center gap-1 text-xl">
              <div>{prettyDate.month}</div>
              <div>{prettyDate.date}</div>
            </div>
            <div className="text-sm">{prettyDate.time}</div>
          </div>
        </div>
        <div className="flex w-full grow flex-col rounded-l-[2rem] rounded-r-[2rem] bg-secondary-muted p-4 font-secondary text-secondary-foreground sm:rounded-l-[5rem]">
          <div className="ml-[1rem] flex flex-col justify-between sm:ml-[4rem]">
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
              {seats.available > 0 && !isPast && !isSeries && (
                <div className="text-xs font-thin">
                  <span>
                    {seats.available} / {seats.total}
                  </span>
                  <span className="text-xxs">&nbsp;seats available</span>
                </div>
              )}
              {seats.total !== 0 && seats.available <= 0 && (
                <div className="text-xxs font-thin">No seats available</div>
              )}
              {isSeries && (
                <div className="text-xxs uppercase">event series</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardTemplate>
  );
};
