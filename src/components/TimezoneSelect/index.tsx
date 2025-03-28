import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import cn from "classnames";

// Common timezone list focusing on major cities
const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface TimezoneSelectProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  className,
}) => {
  const [timezones, setTimezones] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Start with common timezones
    const zones = new Set(COMMON_TIMEZONES);

    // Add user's local timezone if not in common list
    const localZone = DateTime.local().zoneName;
    if (localZone && !zones.has(localZone)) {
      zones.add(localZone);
    }

    // Add currently selected timezone if not in list
    if (value && !zones.has(value)) {
      zones.add(value);
    }

    setTimezones(Array.from(zones));
  }, [value]);

  // Format timezone for display
  const formatTimezone = (zone: string) => {
    const dt = DateTime.now().setZone(zone);
    if (!dt.isValid) return zone;

    const offset = dt.toFormat("ZZ"); // Gets offset like "+04:00"
    const city = zone.split("/").pop()?.replace("_", " ");
    return `GMT${offset} ${city}`;
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 text-sm", className)}>
        <SelectValue placeholder="Select timezone...">
          {value ? formatTimezone(value) : "Select timezone..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {timezones.map((zone) => (
          <SelectItem key={zone} value={zone}>
            {formatTimezone(zone)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimezoneSelect;
