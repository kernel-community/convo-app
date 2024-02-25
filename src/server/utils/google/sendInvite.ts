import { getCalendar } from "./getCalendar";
import { prisma } from "src/server/db";
import { getEvent } from "./getEvent";

export type EventIdentification = {
  community: {
    google: {
      calendarId: string | null;
    } | null;
  } | null;
  gCalEventId: string | null;
  communityId: string | null;
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
        community: {
          select: {
            google: {
              select: {
                calendarId: true,
              },
            },
          },
        },
        communityId: true,
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
  const parsedEvents = await prepareEventIds(events);
  for (let i = 0; i < parsedEvents.length; i++) {
    const communityId = parsedEvents[i]?.communityId;
    if (!communityId) {
      throw new Error(
        `parsing events error: each event must have a community defined. Event: ${parsedEvents[i]}`
      );
    }
    const calendar = await getCalendar({ communityId });
    const calendarId = parsedEvents[i]?.community?.google?.calendarId;
    const eventId = parsedEvents[i]?.gCalEventId;
    if (!calendarId || !eventId) {
      throw new Error(`Error: ${JSON.stringify({ calendarId, eventId })}`);
    }
    const event = await getEvent({ calendarId, eventId, communityId });
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
