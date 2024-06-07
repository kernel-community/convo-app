import type { ICalEventData } from "ical-generator";
import ical, {
  ICalCalendarMethod,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from "ical-generator";

export async function GET() {
  const calendar = ical({
    name: "bugazi cal",
    method: ICalCalendarMethod.REQUEST,
  });
  // Example event, you can pull data from your database here
  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  const event1: ICalEventData = {
    start: startTime,
    end: endTime,
    summary: "Example Event",
    description: "This is an example event",
    location: "800 Howard St., San Francisco, CA 94103",
    url: "http://sebbo.net/",
    repeating: {
      freq: ICalEventRepeatingFreq.DAILY,
      byDay: ICalWeekday.MO,
    },
  };
  const events: Array<ICalEventData> = [event1];
  events.forEach((event) => calendar.createEvent({ ...event }));
  return new Response(calendar.toString(), {
    status: 200,
    headers: { "Content-Type": "text/calendar" },
  });
}
