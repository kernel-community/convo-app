import { Calendar } from "src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";

interface CalendarPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
  children: React.ReactNode;
  eventDates?: Date[];
}

export const CalendarPopover = ({
  isOpen,
  onOpenChange,
  onSelect,
  selectedDate,
  children,
  eventDates = [],
}: CalendarPopoverProps) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="h-[300px] w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onSelect(date);
          }}
          initialFocus
          modifiers={{
            event: eventDates,
          }}
          components={{
            DayContent: ({ date }) => (
              <div className="relative flex h-full w-full items-center justify-center">
                {date.getDate()}
                {eventDates.some(
                  (eventDate) =>
                    eventDate.getDate() === date.getDate() &&
                    eventDate.getMonth() === date.getMonth() &&
                    eventDate.getFullYear() === date.getFullYear()
                ) && (
                  <>
                    <div className="absolute bottom-1 left-1 right-1 h-1 rounded-lg bg-secondary" />
                    {/* <div className="absolute right-1 top-1 bottom-1 w-1 rounded-lg bg-secondary" /> */}
                  </>
                )}
              </div>
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
