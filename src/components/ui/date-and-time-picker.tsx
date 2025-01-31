"use client";

import * as React from "react";
import { TimePickerDropdown } from "./time-picker-dropdown";
import { DatePicker } from "./date-picker";

export function DateAndTimePicker({
  date,
  setDate,
  fromDate,
  disabled = false,
  className,
}: {
  date: Date | undefined;
  fromDate?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 sm:flex-row ${className}`}
    >
      <DatePicker
        date={date}
        setDate={setDate}
        fromDate={fromDate}
        disabled={disabled}
      />
      <TimePickerDropdown date={date} setDate={setDate} />
    </div>
  );
}
