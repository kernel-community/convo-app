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

  // Initialize dates in the original timezone context
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    if (!value?.start) return DateTime.now().toJSDate();

    // If we have a timezone, ensure we're displaying in that timezone
    if (creationTimezone) {
      // Convert the UTC date to the original creation timezone for display
      return DateTime.fromJSDate(value.start)
        .setZone(displayTimezone)
        .toJSDate();
    }

    return value.start;
  });

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (!value?.end) return DateTime.now().plus({ hour: 1 }).toJSDate();

    // If we have a timezone, ensure we're displaying in that timezone
    if (creationTimezone) {
      // Convert the UTC date to the original creation timezone for display
      return DateTime.fromJSDate(value.end).setZone(displayTimezone).toJSDate();
    }

    return value.end;
  });

  const handleChangeCallback = useCallback(
    (e: { start?: Date; end?: Date }) => {
      // When updating, we need to ensure we're converting from display timezone to UTC
      if (creationTimezone && e.start && e.end) {
        // Create date in the creation timezone
        const startInTZ = DateTime.fromJSDate(e.start).setZone(
          creationTimezone
        );
        const endInTZ = DateTime.fromJSDate(e.end).setZone(creationTimezone);

        // Convert to UTC for storage
        const startUTC = startInTZ.toUTC().toJSDate();
        const endUTC = endInTZ.toUTC().toJSDate();

        handleChange({
          start: startUTC,
          end: endUTC,
        });
      } else {
        handleChange(e);
      }
    },
    [handleChange, creationTimezone]
  );

  useEffect(() => {
    handleChangeCallback({
      start: startDate,
      end: endDate,
    });
  }, [startDate, endDate, handleChangeCallback]);

  const getDurationColor = (start: Date, end: Date) => {
    const diffInMinutes = differenceInMinutes(end, start);
    if (diffInMinutes <= 60) return "text-success";
    if (diffInMinutes < 240) return "text-warn";
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
            date={startDate || new Date()}
            setDate={setStartDate}
            fromDate={new Date()}
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
              date={endDate || new Date()}
              setDate={setEndDate}
              fromDate={startDate || new Date()}
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
