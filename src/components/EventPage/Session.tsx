"use client";
import { isPast } from "src/utils/dateTime";
import Image from "next/image";
import cross from "public/vectors/cross.png";
import useUserRsvpForEvent from "src/hooks/useUserRsvpForEvent";
import type { ReactNode } from "react";
import { LuCalendarCheck2 } from "react-icons/lu";
import { useUser } from "src/context/UserContext";

type SessionParams = {
  handleClick: (id: string, checked: boolean, isEdit: boolean) => void;
  data: string;
  date: string;
  time: string;
  availableSeats?: number;
  totalSeats?: number;
  noLimit?: boolean;
  isChecked: boolean;
  startDateTime: string;
};

const RsvpStatus = ({
  isInPresent,
  isRsvp,
  handleClick,
  data,
  isChecked,
  isSeatAvailable,
}: Pick<SessionParams, "handleClick" | "data" | "isChecked"> & {
  isInPresent: boolean;
  isRsvp: boolean | undefined;
  isSeatAvailable: boolean;
}) => {
  if (isRsvp) {
    return (
      <div className="my-auto flex-1 text-left text-xs uppercase">
        <span
          className="inline-flex scale-95 cursor-pointer flex-row items-center gap-1 rounded-full bg-kernel px-2 py-1 text-slate-300 transition-all duration-150 hover:scale-100"
          onClick={() => handleClick(data, false, true)}
        >
          <LuCalendarCheck2 className="h-5 w-5" />
          <span>View RSVP</span>
        </span>
      </div>
    );
  }
  if (isInPresent && !isRsvp && isSeatAvailable) {
    return (
      <input
        onChange={(e) => handleClick(data, e.target.checked, false)}
        disabled={!isInPresent}
        type="checkbox"
        className={`
      m-2
      mr-4 cursor-pointer
      rounded-md border-gray-300
      bg-background
      text-primary focus:border-2 focus:border-primary focus:ring-2 focus:ring-primary dark:border-primary-dark
      dark:text-primary-dark
    `}
        defaultChecked={isChecked}
      />
    );
  }
  if (!isInPresent || !isSeatAvailable) {
    return (
      <div className="mr-4">
        <Image src={cross} width={18} height={17} alt="" />
      </div>
    );
  }
  return <></>;
};

export const EventDateTime = ({
  date,
  time,
}: Pick<SessionParams, "date" | "time">) => {
  return (
    <div className="flex-1 text-left text-xs uppercase [&>*]:my-auto">
      <div>{date}</div>
      <div>{time}</div>
    </div>
  );
};

export const Seats = ({
  availableSeats,
  totalSeats,
  noLimit,
}: Pick<SessionParams, "totalSeats" | "noLimit" | "availableSeats">) => {
  if (noLimit) {
    return <div className="my-auto mr-2 text-xs">No seat limit</div>;
  }
  return (
    <div
      className="
    my-auto mr-4 flex flex-col items-center
    gap-0 justify-self-end text-sm
  "
    >
      <div>
        {availableSeats}/{totalSeats}
      </div>
      <span className="text-xs">Seats Available</span>
    </div>
  );
};

const Wrapper = ({
  isRsvpd,
  children,
  isInPresent,
  isSeatAvailable,
}: {
  isRsvpd: boolean | undefined;
  children: ReactNode;
  isInPresent: boolean;
  handleClick: SessionParams["handleClick"];
  data: SessionParams["data"];
  isSeatAvailable: boolean;
}) => {
  const basic = `cursor-pointer items-center transform transition duration-500 [&>*]:p-2 rounded-md flex py-2.5`;
  const inPresentStyle = `bg-slate-200 hover:bg-slate-300`;
  const seatAvailable = isSeatAvailable && !isRsvpd;
  const seatUnavailableStyle = `bg-slate-200`;
  const look = `${basic} ${
    isInPresent && seatAvailable ? inPresentStyle : ""
  } ${!seatAvailable ? seatUnavailableStyle : ""}`;
  if (isRsvpd) {
    return <div className={look}>{children}</div>;
  }
  return <label className={look}>{children}</label>;
};
const Session = ({
  handleClick,
  data,
  date,
  time,
  availableSeats,
  totalSeats,
  noLimit,
  isChecked,
  startDateTime,
}: SessionParams) => {
  const { fetchedUser: user } = useUser();
  const isInPresent = !isPast(startDateTime);
  const isSeatAvailable =
    noLimit || (availableSeats ? availableSeats > 0 : false);

  const { isRsvpd } = useUserRsvpForEvent({
    eventId: data,
    // dont fetch if in the past
    dontFetch: false,
  });
  return (
    <Wrapper
      isInPresent={isInPresent}
      data={data}
      handleClick={handleClick}
      isRsvpd={isRsvpd}
      isSeatAvailable={isSeatAvailable}
    >
      <RsvpStatus
        handleClick={handleClick}
        isInPresent={isInPresent}
        isRsvp={isRsvpd}
        data={data}
        isChecked={isChecked}
        isSeatAvailable={isSeatAvailable}
      />
      <EventDateTime date={date} time={time} />
      {!isRsvpd && (
        <Seats
          availableSeats={availableSeats}
          totalSeats={totalSeats}
          noLimit={noLimit}
        />
      )}
    </Wrapper>
  );
};
export default Session;
