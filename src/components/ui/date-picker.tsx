import { format } from "date-fns";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";

export const DatePicker = ({
  date,
  setDate,
  fromDate,
  disabled = false,
}: {
  date: Date | undefined;
  fromDate?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}) => {
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
  const isDesktop = useMediaQuery("(min-width: 640px)");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start p-2 text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-success" />
          {date && !disabled ? (
            format(date, "EEE, MMM d")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
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
};
