"use client";

import * as React from "react";
import { TimePickerDropdown } from "./time-picker-dropdown";
import { DatePicker } from "./date-picker";
import { DateTime } from "luxon";

export function DateAndTimePicker({
  date,
  setDate,
  fromDate,
  disabled = false,
  className,
  timezone,
}: {
  date: Date | undefined;
  fromDate?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  timezone?: string;
}) {
  // Convert UTC date to local date for display in UI components
  const getLocalDisplayDate = React.useCallback(
    (utcDate: Date | undefined): Date | undefined => {
      if (!utcDate || !timezone) return utcDate;

      // 1. Create a Luxon DateTime from the UTC date
      const luxonUTC = DateTime.fromJSDate(utcDate, { zone: "utc" });

      // 2. Convert to the target timezone
      const luxonInTimezone = luxonUTC.setZone(timezone);

      // 3. Create a local date with the same components
      // This is necessary because JS Date objects always display in local timezone
      const localDate = new Date(
        luxonInTimezone.year,
        luxonInTimezone.month - 1, // JS months are 0-indexed
        luxonInTimezone.day,
        luxonInTimezone.hour,
        luxonInTimezone.minute
      );

      return localDate;
    },
    [timezone]
  );

  // Convert dates for display
  const displayDate = getLocalDisplayDate(date);
  const displayFromDate = getLocalDisplayDate(fromDate);

  // Handle date changes with timezone awareness
  const handleDateChange = React.useCallback(
    (localDate: Date | undefined) => {
      if (!localDate) {
        setDate(undefined);
        return;
      }

      if (!timezone) {
        // If no timezone specified, just pass through the date
        setDate(localDate);
        return;
      }

      // The localDate is in local timezone as displayed by the UI components
      // We need to interpret it as being in the specified timezone, then convert to UTC

      // 1. Create a Luxon DateTime with the same components as the JS Date, but in the specified timezone
      const luxonDate = DateTime.fromObject(
        {
          year: localDate.getFullYear(),
          month: localDate.getMonth() + 1, // Luxon months are 1-indexed
          day: localDate.getDate(),
          hour: localDate.getHours(),
          minute: localDate.getMinutes(),
        },
        { zone: timezone }
      );

      // 2. Convert to UTC and back to JS Date
      const utcDate = luxonDate.toUTC().toJSDate();

      setDate(utcDate);
    },
    [setDate, timezone]
  );

  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      <div className="w-[230px]">
        <DatePicker
          date={displayDate}
          setDate={handleDateChange}
          fromDate={displayFromDate}
          disabled={disabled}
        />
      </div>
      <div className="w-[110px]">
        <TimePickerDropdown date={displayDate} setDate={handleDateChange} />
      </div>
    </div>
  );
}
