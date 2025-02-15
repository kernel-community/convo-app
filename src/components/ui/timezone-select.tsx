import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  // Get all timezone names
  const timezones = Intl.supportedValuesOf("timeZone");

  // Convert UTC to Etc/UTC if needed
  const normalizedValue = value === "UTC" ? "Etc/UTC" : value;

  console.log("TimezoneSelect:", {
    providedValue: value,
    normalizedValue,
    isInTimezones: timezones.includes(normalizedValue),
    timezoneCount: timezones.length,
  });

  // Get current timezone offset for each timezone
  const timezonesWithOffset = timezones.map((zone) => {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value || "";
    return {
      value: zone,
      label: `${zone.replace("_", " ")} (${offset})`,
    };
  });

  // Sort by offset and name
  timezonesWithOffset.sort((a, b) => {
    const offsetA = a.label.slice(a.label.lastIndexOf("GMT"));
    const offsetB = b.label.slice(b.label.lastIndexOf("GMT"));
    if (offsetA === offsetB) {
      return a.value.localeCompare(b.value);
    }
    return offsetA.localeCompare(offsetB);
  });

  return (
    <Select value={normalizedValue} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {timezonesWithOffset.map(({ value: tz, label }) => (
          <SelectItem key={tz} value={tz}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
