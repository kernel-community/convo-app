"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "src/lib/utils";
import { Input } from "./input";

interface TimePickerDropdownProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
}

export function TimePickerDropdown({ date, setDate }: TimePickerDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  // Generate time options in 1-minute intervals
  const timeOptions = React.useMemo(() => {
    const options = [];
    const now = new Date();
    // Start from 12:00 AM (00:00)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date(now);
        time.setHours(hour, minute);
        options.push({
          value: format(time, "h:mm a"),
          date: new Date(time),
        });
      }
    }
    return options;
  }, []);

  const parseTimeInput = (
    input: string
  ): { hours: number; minutes: number } | null => {
    if (!input) return null;

    // Normalize the input
    const normalized = input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/\./g, ""); // Remove periods from a.m./p.m.

    // First try to match patterns with minutes
    const match = normalized.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
    if (match) {
      const [_, hours, minutes, period] = match;

      // Check if hours or minutes are undefined
      if (!hours || !minutes || !period) return null;

      const parsedHours = parseInt(hours, 10);
      const parsedMinutes = parseInt(minutes, 10);

      // Check if parsing resulted in NaN
      if (isNaN(parsedHours) || isNaN(parsedMinutes)) return null;

      // Validate hours and minutes
      if (parsedHours < 1 || parsedHours > 12 || parsedMinutes >= 60) {
        return null;
      }

      // Convert hours to 24-hour format
      const finalHours =
        period === "pm" && parsedHours !== 12
          ? parsedHours + 12
          : period === "am" && parsedHours === 12
          ? 0
          : parsedHours;

      return { hours: finalHours, minutes: parsedMinutes };
    }

    // Then try to match patterns without minutes
    const match2 = normalized.match(/^(\d{1,2})(am|pm)$/);
    if (match2) {
      const [_, hours, period] = match2;

      // Check if hours or period are undefined
      if (!hours || !period) return null;

      const parsedHours = parseInt(hours, 10);

      // Check if parsing resulted in NaN
      if (isNaN(parsedHours)) return null;

      // Validate hours
      if (parsedHours < 1 || parsedHours > 12) {
        return null;
      }

      // Convert hours to 24-hour format
      const finalHours =
        period === "pm" && parsedHours !== 12
          ? parsedHours + 12
          : period === "am" && parsedHours === 12
          ? 0
          : parsedHours;

      return { hours: finalHours, minutes: 0 };
    }

    return null;
  };

  const updateTime = (timeStr: string) => {
    if (!date) return;

    const parsedTime = parseTimeInput(timeStr);
    if (parsedTime) {
      const newDate = new Date(date);
      newDate.setHours(parsedTime.hours);
      newDate.setMinutes(parsedTime.minutes);
      setDate(newDate);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const parsedTime = parseTimeInput(value);
    if (parsedTime) {
      const tempDate = new Date();
      tempDate.setHours(parsedTime.hours);
      tempDate.setMinutes(parsedTime.minutes);
      setInputValue(format(tempDate, "h:mm a"));
      updateTime(value);
    }
  };

  const handleOptionClick = (option: { value: string; date: Date }) => {
    if (!date) return;

    setInputValue(option.value);
    const newDate = new Date(date);
    newDate.setHours(option.date.getHours(), option.date.getMinutes());
    setDate(newDate);
    setOpen(false);
  };

  // Update input value when date changes
  // Find the closest time option to the current date
  const findClosestTimeIndex = React.useCallback(
    (currentDate: Date) => {
      if (!timeOptions.length) return 0;

      let closestIndex = 0;
      let minDiff = Infinity;

      timeOptions.forEach((option, index) => {
        const diff = Math.abs(option.date.getTime() - currentDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      return closestIndex;
    },
    [timeOptions]
  );

  React.useEffect(() => {
    if (date && !inputRef.current?.matches(":focus")) {
      setInputValue(format(date, "h:mm a"));
    }
  }, [date]);

  // Scroll to the active option when dropdown opens
  React.useEffect(() => {
    if (open && dropdownRef.current && date) {
      const index = findClosestTimeIndex(date);
      setActiveIndex(index);

      const optionHeight = 32; // Approximate height of each option
      const scrollPosition = index * optionHeight;

      dropdownRef.current.scrollTop =
        scrollPosition -
        dropdownRef.current.clientHeight / 2 +
        optionHeight / 2;
    }
  }, [open, date, findClosestTimeIndex]);

  const filteredOptions = timeOptions;

  return (
    <div className="relative w-[140px]">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Small delay to allow for option clicks
          setTimeout(() => setOpen(false), 200);
        }}
        placeholder="Enter time..."
        className="w-full p-2"
      />
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div ref={dropdownRef} className="max-h-[170px] overflow-auto p-1">
            {timeOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                  (inputValue === option.value ||
                    timeOptions.indexOf(option) === activeIndex) &&
                    "bg-accent text-accent-foreground"
                )}
                onMouseDown={(e) => {
                  // Prevent the input's onBlur from firing before the click
                  e.preventDefault();
                }}
                onClick={() => handleOptionClick(option)}
              >
                {option.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
