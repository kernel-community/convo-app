import type { calendar_v3 } from "googleapis";
import { getCalendar } from "./getCalendar";
import type { FullEvent } from "src/app/api/actions/google/createEvent";
import { getEvent } from "./getEvent";
import { pick } from "lodash";

type UpdatableFullEvents = Array<FullEvent>;

type ParsedEvents = Array<
  calendar_v3.Schema$Event & {
    gCalEventId?: string;
    gCalId?: string | null;
    isDeleted?: boolean;
    databaseId?: string;
    communityId: string;
  }
>;

export const parseEvents = (
  events: UpdatableFullEvents,
  reqHost: string
): ParsedEvents => {
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const parsed = events.map((event) => {
    if (!event.gCalEventId || !event.community.google.calendarId) {
      throw new Error(`gCalEventId or gCalId not found for: ${event}`);
    }
    const title = event.isDeleted ? `CANCELLED: ${event.title}` : event.title;
    if (!event.communityId) {
      throw new Error("community id must be defined for all events");
    }
    return {
      databaseId: event.id,
      isDeleted: event.isDeleted,
      gCalId: event.community.google.calendarId,
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
      communityId: event.communityId,
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
  reqHost,
}: {
  events: {
    updated: UpdatableFullEvents;
    deleted: UpdatableFullEvents;
  };
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

  const eventsToUpdate: ParsedEvents = [];
  // fetch and prefill attendees so the API doesn't wipe them
  // idk why google apis do that 🤷🏽‍♀️
  for (let i = 0; i < parsedEvents.length; i++) {
    const parsedEvent = parsedEvents[i];
    if (!parsedEvent) {
      continue;
    }
    if (parsedEvent.isDeleted) {
      eventsToUpdate.push(parsedEvent);
      continue;
    }
    if (!parsedEvent.gCalEventId || !parsedEvent.gCalId) {
      // throw??
      console.error("gcalEvent id or gCalId in parsed event not found");
      continue;
    }
    const calendarId = parsedEvent.gCalId;
    const event = await getEvent({
      eventId: parsedEvent.gCalEventId,
      calendarId,
      communityId: parsedEvent.communityId,
    });
    const attendees = event.attendees || [];
    eventsToUpdate.push({
      ...parsedEvent,
      attendees,
    });
  }

  const updated = [];

  // update event on google calendar
  for (let i = 0; i < eventsToUpdate.length; i++) {
    const e = eventsToUpdate[i];
    if (!e) continue;
    const calendar = await getCalendar({ communityId: e.communityId });
    const requestBody = pick(e, [
      "summary",
      "attendees",
      "start",
      "end",
      "guestsCanSeeOtherGuests",
      "guestsCanInviteOthers",
      "location",
      "description",
    ]);
    if (!e.gCalId) {
      throw "e.gCalId undefined";
    }
    const updatedEvent = await calendar.events.patch({
      eventId: e.gCalEventId,
      calendarId: e.gCalId,
      requestBody: requestBody,
    });
    updated.push(updatedEvent);
  }

  const ids = updated.map((i, key) => {
    return {
      calendarEventId: i.data.id,
      databaseEventId: allEvents[key]?.id,
    };
  });

  return ids;
};
