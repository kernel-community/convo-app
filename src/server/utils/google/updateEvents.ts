import type { calendar_v3 } from "googleapis";
import { getCalendar } from "./getCalendar";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";
import { getEvent } from "./getEvent";

type UpdatableFullEvents = Array<FullEvent>;

type ParsedEvents = Array<
  calendar_v3.Schema$Event & {
    gCalEventId?: string;
    isDeleted?: boolean;
    databaseId?: string;
  }
>;

export const parseEvents = (
  events: UpdatableFullEvents,
  reqHost: string
): ParsedEvents => {
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const parsed = events.map((event) => {
    if (!event.gCalEventId) {
      throw new Error(`gCalEventId not found for: ${event}`);
    }
    const title = event.isDeleted ? `CANCELLED: ${event.title}` : event.title;
    return {
      databaseId: event.id,
      isDeleted: event.isDeleted,
      gCalEventId: event.gCalEventId,
      summary: title,
      start: {
        dateTime: event.startDateTime.toString(),
      },
      end: {
        dateTime: event.endDateTime.toString(),
      },
      guestsCanSeeOtherGuests: false,
      guestsCanInviteOthers: false, // @note default = true; if required, can make this a param
      location: event.location,
      description:
        `${event.descriptionHtml}${
          event.proposer.nickname
            ? `\n\n${`Proposer: ${event.proposer.nickname}`}`
            : ""
        }` + `${`\nRSVP here: ${protocol}://${reqHost}/rsvp/${event.hash}`}`,
    };
  });
  return parsed;
};

export const updateEvents = async ({
  events,
  calendarId,
  reqHost,
}: {
  events: {
    updated: UpdatableFullEvents;
    deleted: UpdatableFullEvents;
  };
  calendarId: string;
  reqHost: string;
}): Promise<
  Array<{
    calendarEventId: string | null | undefined;
    databaseEventId: string | undefined;
  }>
> => {
  const deletedEvents: UpdatableFullEvents = events.deleted.map((e) => {
    return {
      ...e,
      isDeleted: true,
    };
  });

  const allEvents = [...events.updated, ...deletedEvents];
  const parsedEvents = parseEvents(allEvents, reqHost);
  console.log({ parsedEvents });

  const calendar = await getCalendar();

  const eventsToUpdate: ParsedEvents = [];
  // fetch and prefill attendees so the API doesn't wipe them
  // idk why google apis do that 🤷🏽‍♀️
  for (let i = 0; i < parsedEvents.length; i++) {
    if (!parsedEvents[i]) continue;
    // @ts-expect-error -- @help not sure why ts is throwing an error here
    // for parsedEvents[i] to be potentially undefined
    if (parsedEvents[i].isDeleted) {
      // @ts-expect-error -- ???
      eventsToUpdate.push(parsedEvents[i]);
      continue;
    }
    // @ts-expect-error -- ???
    const event = await getEvent(calendarId, parsedEvents[i].gCalEventId);
    const attendees = event.attendees || [];
    eventsToUpdate.push({
      ...parsedEvents[i],
      attendees,
    });
  }

  // update event on google calendar
  const updateGcalPromises = eventsToUpdate.map((e) => {
    return calendar.events.update({
      calendarId,
      eventId: e.gCalEventId,
      requestBody: e,
    });
  });
  const updated = await Promise.all(updateGcalPromises);

  const ids = updated.map((i, key) => {
    return {
      calendarEventId: i.data.id,
      databaseEventId: allEvents[key]?.id,
    };
  });

  return ids;
};
