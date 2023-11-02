import type { calendar_v3 } from "googleapis";
import { getCalendar } from "./getCalendar";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";
import type { EventType } from "@prisma/client";
import { CALENDAR_IDS } from "src/utils/constants";

export const parseEvents = (
  events: Array<FullEvent>,
  reqHost: string
): Array<calendar_v3.Schema$Event> => {
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const parsed = events.map((event) => {
    return {
      summary: `${event.title}`,
      attendees: [],
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
const getCalendarId = (eventType: EventType | undefined | null) => {
  switch (eventType) {
    case "INTERVIEW":
      return CALENDAR_IDS.interviews;
    case "JUNTO":
      return CALENDAR_IDS.convoProd;
    default:
      return CALENDAR_IDS.convoProd;
  }
};
export const createEvents = async ({
  events,
  reqHost,
  isProd,
}: {
  events: Array<FullEvent>;
  reqHost: string;
  isProd?: boolean;
}): Promise<
  Array<{
    calendarEventId: string | null | undefined;
    databaseEventId: string | undefined;
    calendarId: string | null | undefined;
  }>
> => {
  const parsedEvents = parseEvents(events, reqHost);
  const calendar = await getCalendar();
  const createPromises = parsedEvents.map((e) => {
    const calendarId = isProd
      ? getCalendarId(e.eventType as EventType)
      : CALENDAR_IDS.test;
    return calendar.events.insert({
      calendarId,
      requestBody: e,
    });
  });
  const inserted = await Promise.all(createPromises);

  const ids = inserted.map((i, key) => {
    return {
      calendarEventId: i.data.id,
      databaseEventId: events[key]?.id,
      calendarId: i.data.organizer?.email,
    };
  });

  return ids;
};
