import { useCallback, useEffect, useState } from "react";
import FieldLabel from "./StrongText";
import type { DurationObjectUnits } from "luxon";
import { DateTime } from "luxon";
import {
  addMinutes,
  differenceInMilliseconds,
  differenceInMinutes,
} from "date-fns";
import { DateAndTimePicker } from "./ui/date-and-time-picker";
import { AlertCircle } from "lucide-react";
import { cn } from "src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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

  const getDurationColor = (start: Date, end: Date) => {
    const diffInMinutes = differenceInMinutes(end, start);
    if (diffInMinutes <= 30) return "text-info";
    if (diffInMinutes <= 60) return "text-success";
    if (diffInMinutes <= 180) return "text-warn";
    return "text-destructive";
  };

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

  const durationColor =
    endDate && startDate
      ? getDurationColor(startDate, endDate)
      : "text-muted-foreground";
  const showWarning =
    endDate && startDate && differenceInMinutes(endDate, startDate) > 180;

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
      <div className="grid justify-start gap-3 rounded-lg border-2 border-foreground bg-muted p-4 sm:grid-cols-2 sm:items-center sm:gap-6 sm:p-6">
        <FieldLabel>Start Date and Time</FieldLabel>
        <DateAndTimePicker
          date={startDate || new Date()}
          setDate={setStartDate}
          fromDate={new Date()}
          className="justify-start sm:justify-center"
        />
        <div> {/* blank div for grid spacing */} </div>
        <div className="flex items-center justify-center gap-2 text-center text-sm">
          Duration:{" "}
          <span className={cn("font-semibold", durationColor)}>{duration}</span>
          {showWarning && (
            <Popover>
              <PopoverTrigger>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </PopoverTrigger>
              <PopoverContent className="w-fit p-3">
                <p className="text-sm">Are you sure about this duration?</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <FieldLabel>End Date and Time</FieldLabel>
        <DateAndTimePicker
          date={endDate || new Date()}
          setDate={setEndDate}
          fromDate={startDate || new Date()}
          className="justify-start sm:justify-center"
        />
      </div>
    </div>
  );
};
