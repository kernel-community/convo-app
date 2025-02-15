import { useCallback, useEffect, useState } from "react";
import FieldLabel from "./StrongText";
import type { DurationObjectUnits } from "luxon";
import { DateTime } from "luxon";
import { addMinutes, differenceInMilliseconds } from "date-fns";
import { DateAndTimePicker } from "./ui/date-and-time-picker";
import { TimezoneSelect } from "./ui/timezone-select";

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
  value?: { start?: Date; end?: Date; timezone?: string };
}) => {
  // Initialize with API timezone if available
  const [timezone, setTimezone] = useState(value?.timezone || "Etc/UTC");
  const [startDate, setStartDate] = useState(value?.start);
  const [endDate, setEndDate] = useState(value?.end);

  // Update when value changes
  useEffect(() => {
    if (!value) return;

    // Always set the timezone first if it's provided
    if (value.timezone) {
      console.log("Setting timezone from value:", value.timezone);
      setTimezone(value.timezone);
    }

    // Convert the dates to the correct timezone using Luxon
    if (value.start) {
      const startDt = DateTime.fromJSDate(value.start, {
        zone: value.timezone || "UTC",
      });
      setStartDate(startDt.toJSDate());
    }

    if (value.end) {
      const endDt = DateTime.fromJSDate(value.end, {
        zone: value.timezone || "UTC",
      });
      setEndDate(endDt.toJSDate());
    }
  }, [value]);

  const handleChangeCallback = useCallback(
    (e: { start?: Date; end?: Date; timezone?: string }) => {
      handleChange(e);
    },
    [handleChange]
  );

  useEffect(() => {
    handleChangeCallback({
      start: startDate,
      end: endDate,
      timezone,
    });
  }, [startDate, endDate, timezone, handleChangeCallback]);

  // Convert dates to the selected timezone
  const convertToTimezone = useCallback(
    (date: Date, fromZone: string, toZone: string) => {
      return DateTime.fromJSDate(date, { zone: fromZone })
        .setZone(toZone)
        .toJSDate();
    },
    []
  );

  // Only convert dates if user changes timezone in dropdown
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      value?.timezone &&
      timezone !== value.timezone
    ) {
      console.log("User changed timezone:", {
        from: value.timezone,
        to: timezone,
        dates: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      // Convert to new timezone
      const newStartDate = convertToTimezone(
        startDate,
        value.timezone,
        timezone
      );
      const newEndDate = convertToTimezone(endDate, value.timezone, timezone);

      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  }, [timezone]);

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
      <div className="grid justify-start gap-3 rounded-lg border-0 bg-muted p-4 sm:grid-cols-2 sm:items-center sm:gap-6 sm:p-6">
        <FieldLabel>Timezone</FieldLabel>
        <TimezoneSelect value={timezone} onChange={setTimezone} />
        <div className="col-span-2 my-2 border-b border-gray-200" />
        <FieldLabel>Start Date and Time</FieldLabel>
        <DateAndTimePicker
          date={startDate || new Date()}
          setDate={setStartDate}
          fromDate={new Date()}
          className="justify-start sm:justify-center"
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
          className="justify-start sm:justify-center"
        />
      </div>
    </div>
  );
};
