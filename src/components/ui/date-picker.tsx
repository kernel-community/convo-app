"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, addDays } from "date-fns";
import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";
import { Calendar } from "src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { TimePickerDropdown } from "./time-picker-dropdown";

export function DatePicker({
  date,
  setDate,
  fromDate,
  withTime = false,
  disabled,
}: {
  date: Date | undefined;
  fromDate?: Date;
  setDate: (date: Date | undefined) => void;
  withTime?: boolean;
  disabled?: boolean;
}) {
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || !date) {
      setDate(newDate);
      return;
    }

    // Preserve the time from the existing date
    const updatedDate = new Date(newDate);
    updatedDate.setHours(date.getHours());
    updatedDate.setMinutes(date.getMinutes());
    updatedDate.setSeconds(date.getSeconds());
    updatedDate.setMilliseconds(date.getMilliseconds());

    setDate(updatedDate);
  };
  return (
    <Popover>
      <div className="flex flex-row items-center gap-2">
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {date && !disabled ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        {withTime && <TimePickerDropdown date={date} setDate={setDate} />}
      </div>
      <PopoverContent
        align="start"
        className="flex w-auto flex-col space-y-2 p-2"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          fromDate={fromDate}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
