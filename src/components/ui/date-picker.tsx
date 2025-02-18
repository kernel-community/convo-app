import { format } from "date-fns";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";
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
            "w-[150px] justify-start p-2 text-left font-normal sm:w-[240px]",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {date && !disabled ? (
            isDesktop ? (
              format(date, "PPP")
            ) : (
              format(date, "PP")
            )
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
