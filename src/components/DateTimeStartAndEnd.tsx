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
import { AlertCircle, Info, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

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

// Common timezones array for dropdown
const commonTimezones = [
  // North America
  "America/Adak", // Hawaii-Aleutian (UTC-10/UTC-9)
  "America/Anchorage", // Alaska (UTC-9/UTC-8)
  "America/Los_Angeles", // Pacific Time (UTC-8/UTC-7)
  "America/Phoenix", // Mountain Time - no DST (UTC-7)
  "America/Denver", // Mountain Time (UTC-7/UTC-6)
  "America/Chicago", // Central Time (UTC-6/UTC-5)
  "America/New_York", // Eastern Time (UTC-5/UTC-4)
  "America/Halifax", // Atlantic Time (UTC-4/UTC-3)
  "America/St_Johns", // Newfoundland (UTC-3:30/UTC-2:30)

  // Caribbean/Central America
  "America/Puerto_Rico", // Atlantic Standard Time (UTC-4)
  "America/Panama", // Eastern Standard Time (UTC-5)

  // South America
  "America/Santiago", // Chile (UTC-4/UTC-3)
  "America/Sao_Paulo", // Brazil (UTC-3)
  "America/Argentina/Buenos_Aires", // Argentina (UTC-3)
  "America/Bogota", // Colombia (UTC-5)

  // Europe
  "Atlantic/Reykjavik", // Iceland (UTC+0)
  "Europe/London", // United Kingdom (UTC+0/UTC+1)
  "Europe/Dublin", // Ireland (UTC+0/UTC+1)
  "Europe/Lisbon", // Portugal (UTC+0/UTC+1)
  "Europe/Paris", // France, Central European Time (UTC+1/UTC+2)
  "Europe/Berlin", // Germany (UTC+1/UTC+2)
  "Europe/Madrid", // Spain (UTC+1/UTC+2)
  "Europe/Rome", // Italy (UTC+1/UTC+2)
  "Europe/Amsterdam", // Netherlands (UTC+1/UTC+2)
  "Europe/Brussels", // Belgium (UTC+1/UTC+2)
  "Europe/Athens", // Greece (UTC+2/UTC+3)
  "Europe/Helsinki", // Finland (UTC+2/UTC+3)
  "Europe/Istanbul", // Turkey (UTC+3)
  "Europe/Moscow", // Russia - Moscow (UTC+3)

  // Africa
  "Africa/Cairo", // Egypt (UTC+2)
  "Africa/Lagos", // Nigeria (UTC+1)
  "Africa/Johannesburg", // South Africa (UTC+2)
  "Africa/Nairobi", // Kenya (UTC+3)
  "Africa/Casablanca", // Morocco (UTC+0/UTC+1)

  // Asia
  "Asia/Dubai", // UAE (UTC+4)
  "Asia/Riyadh", // Saudi Arabia (UTC+3)
  "Asia/Tehran", // Iran (UTC+3:30/UTC+4:30)
  "Asia/Karachi", // Pakistan (UTC+5)
  "Asia/Kolkata", // India (UTC+5:30)
  "Asia/Kathmandu", // Nepal (UTC+5:45)
  "Asia/Dhaka", // Bangladesh (UTC+6)
  "Asia/Bangkok", // Thailand (UTC+7)
  "Asia/Singapore", // Singapore (UTC+8)
  "Asia/Jakarta", // Indonesia (UTC+7)
  "Asia/Shanghai", // China (UTC+8)
  "Asia/Seoul", // South Korea (UTC+9)
  "Asia/Tokyo", // Japan (UTC+9)
  "Asia/Taipei", // Taiwan (UTC+8)
  "Asia/Manila", // Philippines (UTC+8)

  // Australia and Oceania
  "Australia/Perth", // Western Australia (UTC+8)
  "Australia/Darwin", // Northern Territory (UTC+9:30)
  "Australia/Brisbane", // Queensland (UTC+10)
  "Australia/Adelaide", // South Australia (UTC+9:30/UTC+10:30)
  "Australia/Sydney", // New South Wales (UTC+10/UTC+11)
  "Australia/Melbourne", // Victoria (UTC+10/UTC+11)
  "Australia/Hobart", // Tasmania (UTC+10/UTC+11)
  "Pacific/Auckland", // New Zealand (UTC+12/UTC+13)
  "Pacific/Fiji", // Fiji (UTC+12/UTC+13)
  "Pacific/Honolulu", // Hawaii (UTC-10)
  "Pacific/Guam", // Guam (UTC+10)

  // Additional North American Timezones for Canadian provinces
  "America/Vancouver", // British Columbia (UTC-8/UTC-7)
  "America/Edmonton", // Alberta (UTC-7/UTC-6)
  "America/Regina", // Saskatchewan - no DST (UTC-6)
  "America/Winnipeg", // Manitoba (UTC-6/UTC-5)
  "America/Toronto", // Ontario (UTC-5/UTC-4)
  "America/Montreal", // Quebec (UTC-5/UTC-4)

  // Special/Misc
  "UTC", // Coordinated Universal Time
];

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

// Timezone combobox component
const TimeZoneCombobox = ({
  value,
  onChange,
  isEditMode = false,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  isEditMode?: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userSelectedTimezone, setUserSelectedTimezone] = useState<
    string | null
  >(null);
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Determine what timezone to display
  const getDisplayValue = () => {
    if (isEditMode) {
      // In edit mode: use user selection if they've made one, otherwise local timezone
      return userSelectedTimezone || localTimezone;
    }
    // In non-edit mode: use the passed value
    return value || localTimezone;
  };

  // Handle timezone change with tracking for edit mode
  const handleTimezoneChange = (timezone: string) => {
    if (isEditMode) {
      setUserSelectedTimezone(timezone);
    }
    onChange(timezone);
  };

  const displayValue = getDisplayValue();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {displayValue
            ? formatTimezoneDisplay(displayValue)
            : "Select timezone..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false} loop={true}>
          <CommandInput
            placeholder="Search timezone..."
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {commonTimezones
                .filter((timezone) =>
                  timezone.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((timezone) => (
                  <CommandItem
                    key={timezone}
                    value={timezone}
                    onSelect={() => {
                      handleTimezoneChange(timezone);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        displayValue === timezone ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {formatTimezoneDisplay(timezone)}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const DateTimeStartAndEnd = ({
  handleChange,
  value,
  creationTimezone,
  onTimezoneChange,
  isEditMode = false,
}: {
  handleChange: (e: any) => void;
  value?: { start?: Date; end?: Date };
  creationTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  isEditMode?: boolean;
}) => {
  // Initialize dates in the original timezone context
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    if (!value?.start) return DateTime.now().toJSDate();

    // If we have a timezone, ensure we're displaying in that timezone
    if (creationTimezone) {
      // Convert the UTC date to the original creation timezone for display
      return DateTime.fromJSDate(value.start)
        .setZone(creationTimezone)
        .toJSDate();
    }

    return value.start;
  });

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (!value?.end) return DateTime.now().plus({ hour: 1 }).toJSDate();

    // If we have a timezone, ensure we're displaying in that timezone
    if (creationTimezone) {
      // Convert the UTC date to the original creation timezone for display
      return DateTime.fromJSDate(value.end)
        .setZone(creationTimezone)
        .toJSDate();
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
        <div className="font-primary text-sm font-light lowercase"></div>
      </FieldLabel>
      <div className="space-y-3 rounded-lg bg-muted p-3">
        {/* Timezone Selection */}
        {onTimezoneChange && (
          <div className="mb-2">
            <div className="mb-1 text-sm font-medium">Timezone</div>
            <TimeZoneCombobox
              value={creationTimezone}
              onChange={onTimezoneChange}
              isEditMode={isEditMode}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This timezone will be used for displaying event times to
              attendees.
            </p>
          </div>
        )}
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
