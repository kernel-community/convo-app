import { NextResponse } from "next/server";
import ical, { ICalEvent } from "ical-generator";

export async function POST() {
  const calendar = ical({ name: "My Calendar ehhehe" });
  // Example event, you can pull data from your database here
  const events = [
    {
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000),
      summary: "Example Event",
      description: "This is an example event",
      location: "800 Howard St., San Francisco, CA 94103",
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
  return NextResponse.json(calendar.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar",
    },
  });
}
