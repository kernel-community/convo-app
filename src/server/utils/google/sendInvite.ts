import { getCalendar } from "./getCalendar";
import { prisma } from "src/server/db";
import { getEvent } from "./getEvent";

export type EventIdentification = {
  gCalId: string | null;
  gCalEventId: string | null;
};

const prepareEventIds = async (
  events: Array<string>
): Promise<Array<EventIdentification | null>> => {
  // for each event in events
  // fetch gCalId and gCalEventId from the database
  // return array of EventIdentification
  const fetchEventsPromise = events.map((eventId) =>
    prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        gCalEventId: true,
        gCalId: true,
      },
    })
  );
  return Promise.all(fetchEventsPromise);
};

export const sendInvite = async ({
  events,
  attendeeEmail,
}: {
  events: Array<string>;
  attendeeEmail: string;
}): Promise<void> => {
  const calendar = await getCalendar();
  const parsedEvents = await prepareEventIds(events);
  for (let i = 0; i < parsedEvents.length; i++) {
    const calendarId = parsedEvents[i]?.gCalId;
    const eventId = parsedEvents[i]?.gCalEventId;
    if (!calendarId || !eventId) {
      throw new Error(`Error: ${JSON.stringify({ calendarId, eventId })}`);
    }
    const event = await getEvent(calendarId, eventId);
    const attendees = event.attendees ? event.attendees : [];
    const alreadyRsvpd = !!attendees.find(
      (attendee) => attendee.email === attendeeEmail
    );
    if (alreadyRsvpd) continue;
    attendees.push({
      email: attendeeEmail,
      responseStatus: "accepted",
    });
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        ...event,
        attendees,
      },
      sendUpdates: "all",
    });
  }
  return;
};
