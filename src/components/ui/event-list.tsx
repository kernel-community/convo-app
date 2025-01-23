import type { RRuleSet } from "rrule";
import { rrulestr } from "rrule";
import { useEffect } from "react";
import { DateTime } from "luxon";
import { useState } from "react";
import type { RRule } from "rrule";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { cleanupRruleString } from "src/utils/cleanupRruleString";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { DESKTOP } from "src/utils/constants";
import { Calendar } from "src/components/ui/calendar";
import { cn } from "src/lib/utils";
import { Button, buttonVariants } from "./button";
import { BasicHighlight } from "../BasicHighlight";
import { getDateTimeString } from "src/utils/dateTime";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Add this interface before the EventsView component
interface SharedProps {
  selectedDates: Date[];
  NUMBER_OF_MONTHS_TO_SHOW: number;
  startDateTime: string;
  onMonthChange: (date: Date) => void;
}

// only for recurring events
export const EventsView = ({
  rruleStr,
  startDateTime,
}: {
  rruleStr: string;
  startDateTime: string;
}) => {
  const isDesktop = useMediaQuery(DESKTOP);
  const NUMBER_OF_MONTHS_TO_SHOW = isDesktop ? 2 : 1;

  // Lift all the state up to the parent component
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [rruleSet, setRruleSet] = useState<RRuleSet | RRule | null>(null);
  const [recurrenceText, setRecurrenceText] = useState<string>("");
  const [rangeStart, setRangeStart] = useState<Date>(
    DateTime.fromISO(startDateTime)
      .set({ day: 1 }) // Only change the day to 1, preserve time
      .toJSDate()
  );

  const onMonthChange = (date: Date) => {
    setRangeStart(date);
  };

  useEffect(() => {
    if (!rruleStr) return;
    const rruleSetObj = rrulestr(cleanupRruleString(rruleStr), {
      // When new Date() is used with an ISO string (e.g., "2024-03-20T14:00:00Z" or "2024-03-20T14:00:00+00:00"):
      // The date is parsed in the browser's timezone.
      dtstart: new Date(startDateTime),
    });
    setRruleSet(rruleSetObj);
    setRecurrenceText(rruleSetObj.toText());
    const rangeEnd = DateTime.fromJSDate(rangeStart)
      .plus({ months: NUMBER_OF_MONTHS_TO_SHOW + 1 })
      .toJSDate();
    setSelectedDates(rruleSetObj.between(rangeStart, rangeEnd));
  }, [rruleStr, rangeStart, NUMBER_OF_MONTHS_TO_SHOW, startDateTime]);

  // Share the same props between both views
  const sharedProps = {
    selectedDates,
    NUMBER_OF_MONTHS_TO_SHOW,
    startDateTime: rangeStart.toISOString(),
    onMonthChange,
  };

  const resetToToday = () => {
    setRangeStart(DateTime.now().startOf("month").toJSDate());
  };

  const reset = () => {
    setRangeStart(DateTime.fromISO(startDateTime).startOf("month").toJSDate());
  };

  return (
    <Tabs defaultValue="calendar">
      <div className="flex w-full flex-wrap items-center justify-between">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List by month</TabsTrigger>
        </TabsList>
        <ResetButtons resetToToday={resetToToday} reset={reset} />
      </div>

      <TabsContent value="calendar">
        <CalendarView {...sharedProps} />
      </TabsContent>
      <TabsContent value="list">
        <ListView {...sharedProps} />
      </TabsContent>
      <RecurringEventText
        recurrenceText={recurrenceText}
        startDateTime={startDateTime}
        rruleSet={rruleSet}
      />
    </Tabs>
  );
};

const RecurringEventText = ({
  recurrenceText,
  startDateTime,
  rruleSet,
}: {
  recurrenceText: string;
  startDateTime: string;
  rruleSet: RRuleSet | RRule | null;
}) => {
  return (
    <>
      <div>
        This is a <span className="font-semibold">recurring convo</span>. It
        occurs:
      </div>
      <div className="font-semibold">
        <BasicHighlight>
          <span>{recurrenceText}</span> at{" "}
          <span>{getDateTimeString(startDateTime, "time")}</span>{" "}
          {rruleSet?.options.dtstart && (
            <span>
              starting from{" "}
              {DateTime.fromJSDate(rruleSet.options.dtstart).toFormat("DDDD")}
            </span>
          )}
        </BasicHighlight>
      </div>
      <div className="text-sm">
        in your local timezone:&nbsp;
        <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
      </div>
    </>
  );
};

const ResetButtons = ({
  resetToToday,
  reset,
}: {
  resetToToday: () => void;
  reset: () => void;
}) => {
  return (
    <div className="flex justify-start gap-2">
      <Button onClick={resetToToday} variant={"ghost"}>
        Today
      </Button>
      <Button onClick={reset} variant={"ghost"}>
        Reset
      </Button>
    </div>
  );
};

const ListView = ({
  selectedDates,
  startDateTime,
  onMonthChange,
}: SharedProps) => {
  // Filter dates to only show current month
  const currentMonthDates = selectedDates.filter((date) =>
    DateTime.fromJSDate(date).hasSame(DateTime.fromISO(startDateTime), "month")
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {DateTime.fromISO(startDateTime).toFormat("MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-muted"
            onClick={() =>
              onMonthChange(
                DateTime.fromISO(startDateTime).minus({ months: 1 }).toJSDate()
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-muted"
            onClick={() =>
              onMonthChange(
                DateTime.fromISO(startDateTime).plus({ months: 1 }).toJSDate()
              )
            }
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {currentMonthDates.map((date) => (
          <EventCard date={date} key={date.toISOString()} />
        ))}
      </div>
    </div>
  );
};

export const EventCard = ({ date }: { date: Date }) => {
  return (
    <div
      className=" flex items-center space-x-4 rounded-md border p-4"
      key={date.toISOString()}
    >
      <p className="text-md font-medium leading-none">
        {getDateTimeString(date.toISOString(), "date")}
      </p>
      <p className="text-sm italic text-muted-foreground">
        at {getDateTimeString(date.toISOString(), "time")}
      </p>
    </div>
  );
};

const CalendarView = ({
  selectedDates,
  NUMBER_OF_MONTHS_TO_SHOW,
  startDateTime,
  onMonthChange,
}: SharedProps) => {
  return (
    <div className="flex w-full flex-col items-center">
      <Calendar
        mode="multiple"
        month={new Date(startDateTime)}
        selected={selectedDates}
        numberOfMonths={NUMBER_OF_MONTHS_TO_SHOW}
        onMonthChange={onMonthChange}
        showOutsideDays={false}
        classNames={{
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 opacity-50 hover:bg-kernel-light/80 hover:text-accent-foreground"
          ),
          day_selected:
            "bg-kernel-light text-primary-foreground font-semibold border-2 border-primary-muted",
          day_today: `${
            selectedDates.includes(new Date()) ? "bg-kernel-light" : ""
          }`,
        }}
      />
    </div>
  );
};
