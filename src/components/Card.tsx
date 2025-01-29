import { DateTime as DT } from "luxon";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Article } from "./Article";

export const CardTemplate = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={`
    lg:h-62
    flex
    cursor-pointer
    flex-col rounded-xl
    bg-card-one
    p-4
    text-primary-muted transition-shadow
    duration-300
    ease-in-out
    hover:shadow-outline dark:text-primary-dark
    sm:m-0 sm:h-64 sm:w-64
    lg:w-72
    `}
    >
      {children}
    </div>
  );
};
export const Card = ({
  title,
  description,
  RSVP,
  limit,
  startDateTime,
  by,
  isSeries,
}: {
  title: string;
  description?: string;
  RSVP?: number;
  limit?: number;
  startDateTime?: string;
  by: string;
  isSeries: boolean;
}) => {
  const [prettyDate, setPrettyDate] = useState<{
    date: string;
    month: string;
    time: string;
  }>({
    date: DT.now().toFormat("dd"),
    month: DT.now().toFormat("LLL"),
    time: DT.now().toFormat("hh: mm a"),
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
    if (!startDateTime) return;
    const d = DT.fromISO(startDateTime);
    setPrettyDate({
      date: d.toFormat("dd"),
      month: d.toFormat("LLL"),
      time: d.toFormat("hh:mm a"),
    });
    if (d.diffNow().milliseconds < 0) setIsPast(true);
  }, [startDateTime]);
  useEffect(() => {
    if (limit === 0) {
      setSeats({
        available: 0,
        total: 0,
      });
    }
    setSeats({
      available: Number(limit) - Number(RSVP),
      total: Number(limit),
    });
  }, [RSVP, limit]);
  // const cardColor = isSeries ? "bg-card-two" : "bg-card-one";
  return (
    <CardTemplate>
      <div className="flex w-full flex-row justify-between gap-3 align-top">
        <div className="flex flex-col justify-start">
          {/* <div className='font-secondary uppercase lg:text-sm sm:text-xs text-xxs'>
            {type}
          </div>*/}
          <div
            className="
            font-heading
            text-lg
            text-white
            dark:text-primary-dark
            sm:text-xl
          "
          >
            {title.replace(/\s/g, "").length < 25
              ? title
              : title.substring(0, 25) + "..."}
          </div>
          <div className="font-primary text-xxs sm:text-xs">{by}</div>
        </div>
        <div className="flex shrink-0 flex-col items-center font-secondary">
          <div className="flex flex-row items-center gap-1 text-sm">
            <div>{prettyDate.month}</div>
            <div>{prettyDate.date}</div>
          </div>
          <div className="text-xxs sm:text-xs 2xl:text-sm">
            {prettyDate.time}
          </div>
        </div>
      </div>
      <div
        className="
        my-4
        flex
        grow
        flex-row
        items-center
        font-primary
        text-sm
      "
      >
        <Article
          html={
            description &&
            (description?.length > 100
              ? description?.substring(0, 80) + "..."
              : description)
          }
          card
        />
      </div>
      <div className="flex flex-row justify-between">
        {seats.available > 0 && !isPast && !isSeries && (
          <div className="font-primary text-xs font-thin">
            <span>
              {seats.available} / {seats.total}
            </span>
            <span className="text-xxs">&nbsp;seats available</span>
          </div>
        )}
        {seats.total !== 0 && seats.available <= 0 && (
          <div className="font-primary text-xxs font-thin">
            No seats available
          </div>
        )}
        {isSeries && (
          <div className="font-primary text-xxs uppercase">event series</div>
        )}
      </div>
    </CardTemplate>
  );
};
