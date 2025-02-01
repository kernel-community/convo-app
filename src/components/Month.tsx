import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { DateTime } from "luxon";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { useQuery } from "react-query";
import type { ClientEvent, EventsRequest } from "src/types";

import { cn } from "src/lib/utils";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { RecurringEventText } from "./ui/event-list";
import { rrulestr } from "rrule";
import { cleanupRruleString } from "src/utils/cleanupRruleString";

export const Month = ({ className }: { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const today = new Date();
  const startOfMonth = DateTime.fromJSDate(today).startOf("month").toJSDate();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!isDesktop && date) {
      setIsDrawerOpen(true);
    }
  };

  // Fetch events for the current month
  const { data: events } = useQuery<ClientEvent[]>(
    ["events", currentMonth],
    async () => {
      const response = await fetch("/api/query/getEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "month",
          now: DateTime.fromJSDate(currentMonth).toISO(),
          take: 100,
        } as EventsRequest),
      });
      const data = await response.json();
      return data.data;
    }
  );

  if (!events) {
    return null;
  }

  // Create a map of dates to events for efficient lookup
  const eventsByDate = events.reduce<Record<string, ClientEvent[]>>(
    (acc, event) => {
      // Add event to its start date
      const date = DateTime.fromISO(event.startDateTime).toFormat("yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);

      // If it's a recurring event, add it to all relevant dates in the current month
      if (event.rrule) {
        const monthStart = DateTime.fromJSDate(currentMonth)
          .startOf("month")
          .toJSDate();
        const monthEnd = DateTime.fromJSDate(currentMonth)
          .endOf("month")
          .toJSDate();

        const rruleSetObject = rrulestr(cleanupRruleString(event.rrule), {
          dtstart: DateTime.fromISO(event.startDateTime).toJSDate(),
        });

        const recurrences = rruleSetObject.between(monthStart, monthEnd, true);

        recurrences.forEach((recurrence) => {
          const recurrenceDate =
            DateTime.fromJSDate(recurrence).toFormat("yyyy-MM-dd");
          if (!acc[recurrenceDate]) acc[recurrenceDate] = [];
          // Only add if it's not the original start date
          if (recurrenceDate !== date) {
            acc[recurrenceDate].push(event);
          }
        });
      }

      return acc;
    },
    {} as Record<string, ClientEvent[]>
  );

  // Custom day content to show event indicators
  const dayContent = (day: Date) => {
    const dateStr = DateTime.fromJSDate(day).toFormat("yyyy-MM-dd");
    const dayEvents = eventsByDate[dateStr] || [];
    const isToday =
      dateStr === DateTime.fromJSDate(today).toFormat("yyyy-MM-dd");

    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-md transition-colors",
            dayEvents.length > 0 && "bg-primary/10 dark:bg-primary/20",
            isToday &&
              "font-bold text-primary ring-2 ring-primary ring-offset-2"
          )}
        >
          {day.getDate()}
        </div>
      </div>
    );
  };

  // Custom month header with navigation
  const monthHeader = ({ displayMonth }: { displayMonth: Date }) => (
    <div className="flex items-center justify-between px-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setCurrentMonth(
            DateTime.fromJSDate(displayMonth).minus({ months: 1 }).toJSDate()
          )
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="font-medium">
        {DateTime.fromJSDate(displayMonth).toFormat("MMMM yyyy")}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setCurrentMonth(
            DateTime.fromJSDate(displayMonth).plus({ months: 1 }).toJSDate()
          )
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // Show events for selected date
  const selectedDateStr = selectedDate
    ? DateTime.fromJSDate(selectedDate).toFormat("yyyy-MM-dd")
    : "";
  const selectedDateEvents = selectedDate
    ? eventsByDate[selectedDateStr] || []
    : [];

  const calendarView = (
    <div className="bg-card h-[740px] rounded-lg border">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        month={currentMonth}
        components={{
          DayContent: ({ date }) => dayContent(date),
          Caption: ({ displayMonth }) => monthHeader({ displayMonth }),
        }}
        className="h-full w-full"
        classNames={{
          months: "flex h-full flex-col",
          month: "flex-1 h-full",
          table: "w-full h-full border-collapse",
          head_row: "grid grid-cols-7 mb-2",
          head_cell:
            "text-muted-foreground font-normal text-[0.8rem] h-10 flex items-center justify-center",
          row: "grid grid-cols-7 mt-2",
          cell: cn(
            "min-h-[4rem] lg:min-h-[6rem] p-0.5 relative focus-within:relative focus-within:z-20",
            "[&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-full w-full rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            "aria-selected:opacity-100 flex items-center justify-center"
          ),
          day_selected:
            "bg-primary/10 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary/50 focus:text-primary-foreground",
        }}
      />
    </div>
  );

  const eventsListView = (
    <div className="flex h-[740px] flex-col rounded-lg border">
      {selectedDate && (
        <div className="border-b">
          <h3 className="p-4 font-medium">
            Events on{" "}
            {DateTime.fromJSDate(selectedDate).toFormat("MMMM d, yyyy")}
          </h3>
        </div>
      )}
      <div className="overflow-auto p-4">
        {selectedDate ? (
          selectedDateEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => (
                <EventDescription key={event.hash} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events on this date</p>
          )
        ) : (
          <p className="text-muted-foreground">Select a date to view events</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {isDesktop ? (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">{calendarView}</div>
          <div className="col-span-1">{eventsListView}</div>
        </div>
      ) : (
        <>
          {calendarView}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent>
              <div className="max-h-[85vh] overflow-y-auto">
                <DrawerHeader className="sticky top-0 z-10 bg-background">
                  <DrawerTitle>
                    {selectedDate &&
                      DateTime.fromJSDate(selectedDate).toFormat(
                        "MMMM d, yyyy"
                      )}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <EventDescription key={event.hash} event={event} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No events on this date
                    </p>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
};

const EventDescription = ({ event }: { event: ClientEvent }) => {
  if (event.rrule) {
    const rruleSetObject = rrulestr(cleanupRruleString(event.rrule), {
      // When new Date() is used with an ISO string (e.g., "2024-03-20T14:00:00Z" or "2024-03-20T14:00:00+00:00"):
      // The date is parsed in the browser's timezone.
      dtstart: DateTime.fromISO(event.startDateTime).toJSDate(),
    });
    const rruleString = rruleSetObject.toText();
    return (
      <Link
        key={event.hash}
        href={`/rsvp/${event.hash}`}
        className="block rounded-lg border p-3 hover:bg-accent"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="font-medium">{event.title}</div>
        <div className="text-sm text-muted-foreground">
          <RecurringEventText
            recurrenceText={rruleString}
            startDateTime={event.startDateTime}
            rruleSet={rruleSetObject}
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      key={event.hash}
      href={`/rsvp/${event.hash}`}
      className="block rounded-lg border p-3 hover:bg-accent"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="font-medium">{event.title}</div>
      <div className="text-sm text-muted-foreground">
        {DateTime.fromISO(event.startDateTime).toFormat("t")} -{" "}
        {DateTime.fromISO(event.endDateTime).toFormat("t")}
      </div>
    </Link>
  );
};
