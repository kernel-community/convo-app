import type { ICalEventData } from "ical-generator";
import ical, { ICalCalendarMethod } from "ical-generator";
import { datetime, RRule } from "rrule";

export async function GET() {
  const calendar = ical({
    name: "bugazi cal",
    method: ICalCalendarMethod.REQUEST,
  });
  // Example event, you can pull data from your database here
  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  const rule = new RRule({
    freq: RRule.WEEKLY,
    interval: 5,
    byweekday: [RRule.MO, RRule.FR],
    dtstart: datetime(2012, 2, 1, 10, 30),
    until: datetime(2012, 12, 31),
  });
  const event1: ICalEventData = {
    start: startTime,
    end: endTime,
    summary: "Example Event",
    description: "This is an example event",
    location: "800 Howard St., San Francisco, CA 94103",
    url: "http://sebbo.net/",
    repeating: rule.toString(),
  };
  console.log(rule.toText());
  const events: Array<ICalEventData> = [event1];
  events.forEach((event) => calendar.createEvent({ ...event }));
  return new Response(calendar.toString(), {
    status: 200,
    headers: { "Content-Type": "text/calendar" },
  });
}
