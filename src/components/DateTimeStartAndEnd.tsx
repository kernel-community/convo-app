import { useCallback, useEffect, useState } from "react";
import FieldLabel from "./StrongText";
import type { DurationObjectUnits } from "luxon";
import { DateTime } from "luxon";
import { addMinutes, differenceInMilliseconds } from "date-fns";
import { DateAndTimePicker } from "./ui/date-and-time-picker";

const durationObjectToHumanReadableString = (obj: DurationObjectUnits) => {
  const { years, months, days, hours, minutes } = obj;
  let str = ``;
  if (years) {
    str += Math.floor(years) + ` year${years > 1 ? "s" : ""} `;
  }
  if (months) {
    str += Math.floor(months) + ` month${months > 1 ? "s" : ""} `;
  }
  if (days) {
    str += Math.floor(days) + ` day${days > 1 ? "s" : ""} `;
  }
  if (hours) {
    str += Math.floor(hours) + ` hour${hours > 1 ? "s" : ""} `;
  }
  if (minutes) {
    str += Math.floor(minutes) + ` minute${minutes > 1 ? "s" : ""} `;
  }

  return str;
};

export const DateTimeStartAndEnd = ({
  handleChange,
  value,
}: {
  handleChange: (e: any) => void;
  value?: { start?: Date; end?: Date };
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    value?.start || DateTime.now().toJSDate()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    value?.end || DateTime.now().plus({ hour: 1 }).toJSDate()
  );

  const handleChangeCallback = useCallback(
    (e: { start?: Date; end?: Date }) => {
      handleChange(e);
    },
    [handleChange]
  );

  useEffect(() => {
    handleChangeCallback({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate, handleChangeCallback]);

  const duration =
    endDate && startDate
      ? durationObjectToHumanReadableString(
          DateTime.fromJSDate(endDate)
            .diff(DateTime.fromJSDate(startDate), [
              "years",
              "months",
              "days",
              "hours",
              "minutes",
            ])
            .toObject()
        )
      : `0 minutes`;

  // Validate dates whenever either one changes
  useEffect(() => {
    if (!startDate || !endDate) return;

    const diffInMs = differenceInMilliseconds(endDate, startDate);
    if (diffInMs < 0) {
      // If end is before start, move end to start + 1 hour
      setEndDate(addMinutes(startDate, 60));
    }
  }, [startDate, endDate]); // Run when either date changes

  return (
    <div>
      <FieldLabel>
        When?
        <div className="font-primary text-sm font-light lowercase">
          {
            "Define start and end times and optionally a recurring schedule for your Convo"
          }
        </div>
      </FieldLabel>
      <div className="grid grid-cols-2 items-center gap-6 rounded-lg border-0 bg-muted p-4 sm:gap-6 sm:p-6">
        <FieldLabel>Start Date and Time</FieldLabel>
        <DateAndTimePicker
          date={startDate || new Date()}
          setDate={setStartDate}
          fromDate={new Date()}
          className="justify-center"
        />
        <div> {/* blank div for grid spacing */} </div>
        <div className="text-center text-sm text-gray-500">
          Duration: <span className="font-semibold">{duration}</span>
        </div>
        <FieldLabel>End Date and Time</FieldLabel>
        <DateAndTimePicker
          date={endDate || new Date()}
          setDate={setEndDate}
          fromDate={startDate || new Date()}
          className="justify-center"
        />
      </div>
    </div>
  );
};
