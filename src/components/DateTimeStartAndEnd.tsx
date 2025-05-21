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
import { AlertCircle, Info } from "lucide-react";
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

// Helper function to format timezone with offset
const formatTimezoneDisplay = (timezone: string): string => {
  try {
    const now = DateTime.now().setZone(timezone);
    const offset = now.toFormat("ZZZZ"); // e.g., GMT-04:00
    return `${timezone.replace("_", " ")} (${offset})`;
  } catch (e) {
    return timezone;
  }
};

export const DateTimeStartAndEnd = ({
  handleChange,
  value,
  creationTimezone,
}: {
  handleChange: (e: any) => void;
  value?: { start?: Date; end?: Date };
  creationTimezone?: string;
}) => {
  // Get user's local timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Use creation timezone if provided, otherwise fall back to local
  const displayTimezone = creationTimezone || localTimezone;

  // Check if we're using a different timezone than local
  const isUsingOriginalTimezone =
    creationTimezone && creationTimezone !== localTimezone;

  // Store dates as Luxon DateTime objects to properly handle timezone conversion
  const [startDateTime, setStartDateTime] = useState<DateTime | undefined>(
    value?.start
      ? DateTime.fromISO(value.start.toISOString(), { zone: "utc" }).setZone(
          displayTimezone
        )
      : undefined
  );

  const [endDateTime, setEndDateTime] = useState<DateTime | undefined>(
    value?.end
      ? DateTime.fromISO(value.end.toISOString(), { zone: "utc" }).setZone(
          displayTimezone
        )
      : undefined
  );

  // These functions convert between local time (as shown in UI) and display timezone (as stored in state)
  const setStartDate = useCallback(
    (localDate: Date | undefined) => {
      if (!localDate) {
        setStartDateTime(undefined);
        return;
      }

      // When a date comes from the UI picker, it's already in the correct display timezone
      // We just need to create a proper Luxon DateTime object in that timezone
      const newDateTime = DateTime.fromJSDate(localDate, {
        zone: displayTimezone,
      });
      setStartDateTime(newDateTime);
    },
    [displayTimezone]
  );

  const setEndDate = useCallback(
    (localDate: Date | undefined) => {
      if (!localDate) {
        setEndDateTime(undefined);
        return;
      }

      // When a date comes from the UI picker, it's already in the correct display timezone
      // We just need to create a proper Luxon DateTime object in that timezone
      const newDateTime = DateTime.fromJSDate(localDate, {
        zone: displayTimezone,
      });
      setEndDateTime(newDateTime);
    },
    [displayTimezone]
  );

  // Call handleChange whenever start or end dates change
  useEffect(() => {
    // Only call handleChange if we have valid dates to report
    if (startDateTime || endDateTime) {
      handleChange({
        start: startDateTime ? startDateTime.toUTC().toJSDate() : undefined,
        end: endDateTime ? endDateTime.toUTC().toJSDate() : undefined,
      });
    }
  }, [startDateTime, endDateTime, handleChange]);

  const getDurationColor = (start: Date, end: Date) => {
    const diffInMinutes = differenceInMinutes(end, start);
    if (diffInMinutes <= 60) return "text-success";
    if (diffInMinutes < 240) return "text-warn";
    return "text-destructive";
  };

  // Calculate duration directly in the display timezone
  const duration =
    endDateTime && startDateTime
      ? durationObjectToHumanReadableString(
          endDateTime
            .diff(startDateTime, [
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
    endDateTime && startDateTime
      ? getDurationColor(
          startDateTime.toUTC().toJSDate(),
          endDateTime.toUTC().toJSDate()
        )
      : "text-muted-foreground";
  const showWarning =
    endDateTime &&
    startDateTime &&
    differenceInMinutes(
      endDateTime.toUTC().toJSDate(),
      startDateTime.toUTC().toJSDate()
    ) > 180;

  return (
    <div>
      <FieldLabel>
        Date and Time
        <div className="font-primary text-sm font-light lowercase">
          {isUsingOriginalTimezone ? (
            <span className="flex items-center gap-1 font-medium text-amber-500">
              <Info className="h-4 w-4" />
              Displaying times in original timezone:{" "}
              {formatTimezoneDisplay(displayTimezone)}
            </span>
          ) : (
            "Define start and end times and optionally a recurring schedule for your convo"
          )}
        </div>
      </FieldLabel>
      <div className="space-y-3 rounded-lg bg-muted p-3">
        <div className="grid grid-cols-[auto,1fr] items-start gap-4">
          <div className="flex items-center gap-2 pt-2.5">
            <div className="flex h-2 w-2 items-center">
              <div className="h-2 w-2 rounded-full bg-success"></div>
            </div>
            <span className="w-8 text-sm">Start</span>
          </div>
          <DateAndTimePicker
            date={startDateTime?.toUTC().toJSDate() || new Date()}
            setDate={setStartDate}
            fromDate={new Date()}
            timezone={displayTimezone}
          />
        </div>
        <div className="grid grid-cols-[auto,1fr] items-start gap-4">
          <div className="flex items-center gap-2 pt-2.5">
            <div className="flex h-2 w-2 items-center">
              <div className="h-2 w-2 rounded-full border border-success"></div>
            </div>
            <span className="w-8 text-sm">End</span>
          </div>
          <div className="space-y-1">
            <DateAndTimePicker
              date={endDateTime?.toUTC().toJSDate() || new Date()}
              setDate={setEndDate}
              fromDate={new Date()}
              timezone={displayTimezone}
            />
            <div className="flex items-center gap-2 whitespace-nowrap pl-2 text-sm">
              <span className={cn("font-medium", durationColor)}>
                Duration: {duration}
              </span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
