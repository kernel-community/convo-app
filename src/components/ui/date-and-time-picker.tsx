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
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      <div className="w-[230px]">
        <DatePicker
          date={date}
          setDate={setDate}
          fromDate={fromDate}
          disabled={disabled}
        />
      </div>
      <div className="w-[110px]">
        <TimePickerDropdown date={date} setDate={setDate} />
      </div>
    </div>
  );
}
