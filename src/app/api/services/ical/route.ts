import { NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";

export async function GET() {
  const calendar = ical({
    name: "My Calendar ehhehe",
    method: ICalCalendarMethod.REQUEST,
  });
  // Example event, you can pull data from your database here
  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  const events = [
    {
      start: startTime,
      end: endTime,
      summary: "Example Event",
      description: "This is an example event",
      location: "800 Howard St., San Francisco, CA 94103",
      url: "http://sebbo.net/",
    },
    // Add more events as needed
  ];
  events.forEach((event) => {
    calendar.createEvent({
      start: event.start,
      end: event.end,
      summary: event.summary,
      description: event.description,
      location: event.location,
    });
  });
  return new Response(calendar.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar",
    },
  });
}
