import Image from "next/image";
import deleteIcon from "../../../../public/vectors/delete.png";
import DefaultDatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import type { Session } from "src/components/ProposeForm/index";

export type DateTimeHandleChangeType = (
  type: "dateTime" | "duration",
  count: number,
  value: Date | string
) => void;
export type DateTimeHandleDeleteType = (count: number) => void;

const DateTime = ({
  count,
  displayDelete,
  handleChange,
  handleDelete,
  deleteSessionData,
  session,
}: {
  count: number;
  displayDelete: boolean;
  handleChange: DateTimeHandleChangeType;
  handleDelete?: DateTimeHandleDeleteType;
  deleteSessionData: DateTimeHandleDeleteType;
  session?: Session;
}) => {
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(
    session?.dateTime
  );
  return (
    <div
      className={`
      flex flex-row flex-wrap items-center gap-2 py-4 sm:flex-nowrap
    `}
    >
      <div>
        <DefaultDatePicker
          selected={startDate}
          onChange={(date: Date) => {
            setStartDate(date);
            handleChange("dateTime", count, date);
          }}
          shouldCloseOnSelect
          showTimeSelect={true}
          placeholderText="date & time"
          dateFormat="MM/dd, h:mm aa"
          className={`
            rounded-lg font-primary focus:border-primary
            focus:ring-primary
          `}
          minDate={now}
        />
      </div>
      <div>
        <input
          type="number"
          name="duration"
          onChange={(e) => handleChange("duration", count, e.target.value)}
          placeholder={"Duration (in hours)"}
          required
          className="rounded-lg font-primary focus:border-primary focus:ring-primary"
          // defaultValue={session?.duration}
        />
      </div>

      {displayDelete ? (
        <div className="cursor-pointer">
          <Image
            src={deleteIcon}
            data-key={count}
            onClick={() => {
              if (handleDelete) {
                handleDelete(count);
              }
              deleteSessionData(count);
            }}
            height={25}
            width={25}
            alt="delete button"
          />
        </div>
      ) : null}
    </div>
  );
};

export default DateTime;
