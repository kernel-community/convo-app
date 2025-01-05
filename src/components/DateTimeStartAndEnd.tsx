import { useEffect, useState } from "react";
import FieldLabel from "./StrongText";
import { DatePicker } from "./ui/date-picker";
import type { DurationObjectUnits } from "luxon";
import { DateTime } from "luxon";
import { addMinutes, differenceInMilliseconds } from "date-fns";

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
    value?.end || DateTime.now().plus({ minutes: 30 }).toJSDate()
  );

  useEffect(() => {
    handleChange({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate]);

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

  useEffect(() => {
    if (
      endDate &&
      startDate &&
      differenceInMilliseconds(endDate, startDate) < 0
    ) {
      setEndDate(addMinutes(startDate, 30));
    }
  }, [startDate]);

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
      <div className="grid grid-cols-1 items-center gap-6 rounded-xl border-2 border-primary bg-primary-light p-4 dark:border-primary-dark dark:bg-background sm:gap-6 sm:p-6">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <FieldLabel>Start Date and Time</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DatePicker
              date={startDate || new Date()}
              setDate={setStartDate}
              fromDate={new Date()}
              withTime
            />
          </div>
        </div>
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <FieldLabel>End Date and Time</FieldLabel>
          <div className="flex flex-row gap-3 sm:flex-col sm:items-end">
            <DatePicker
              date={endDate || new Date()}
              setDate={setEndDate}
              fromDate={startDate}
              withTime
            />
          </div>
        </div>
        <div className="text-right font-inter text-xs text-gray-500">
          Duration: {duration}
        </div>
      </div>
    </div>
  );
};
