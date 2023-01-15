import { DateTime as DT } from "luxon";
import { useEffect, useState } from "react";
export const Card = ({
  title,
  descriptionText,
  RSVP,
  limit,
  startDateTime,
  by,
  isSeries,
}: {
  title: string;
  descriptionText?: string;
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
      time: d.toFormat("hh: mm a"),
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
  return (
    <div
      className={`
        lg:h-62
        m-4
        flex
        cursor-pointer
        flex-col rounded-lg
        bg-white
        bg-gradient-to-tl
        from-indigo-900 to-slate-900
        p-4
        text-primary-muted
        transition-shadow
        duration-300
        ease-in-out
        hover:shadow-outline sm:m-0
        sm:h-64 sm:w-64 lg:w-72
      `}
    >
      <div className="flex w-full flex-row justify-between gap-3">
        <div className="flex flex-col justify-start">
          {/* <div className='font-secondary uppercase lg:text-sm sm:text-xs text-xxs'>
            {type}
          </div>*/}
          <div
            className="
            font-heading
            text-base
            sm:text-xl
            lg:text-2xl
          "
          >
            {title.replace(/\s/g, "").length < 25
              ? title
              : title.substring(0, 25) + "..."}
          </div>
          <div className="font-primary text-xxs sm:text-xs lg:text-sm">
            {by}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center place-self-center font-secondary">
          <div className="text-xxs sm:text-base lg:text-lg">
            {prettyDate.date}, {prettyDate.month}
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
        text-xxs
        sm:text-sm
        lg:text-base
      "
      >
        <div>
          {descriptionText &&
            (descriptionText?.length > 100
              ? descriptionText?.substring(0, 80) + "..."
              : descriptionText)}
        </div>
      </div>
      <div className="flex flex-row justify-between">
        {seats.available > 0 && !isPast && !isSeries && (
          <div className="font-primary text-sm font-thin lg:text-base">
            <span>
              {seats.available} / {seats.total}
            </span>
            <span className="text-xs lg:text-sm">&nbsp;seats available</span>
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
    </div>
  );
};
