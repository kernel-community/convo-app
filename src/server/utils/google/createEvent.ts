import type { calendar_v3 } from "googleapis";
import { getCalendar } from "./getCalendar";
import type { FullEvent } from "src/pages/api/actions/google/createEvent";

export const parseEvents = (
  events: Array<FullEvent>,
  reqHost: string
): Array<calendar_v3.Schema$Event> => {
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
        }` + `${`\nRSVP here: https://${reqHost}/rsvp/${event.hash}`}`,
    };
  });
  return parsed;
};

export const createEvents = async ({
  events,
  calendarId,
  reqHost,
}: {
  events: Array<FullEvent>;
  calendarId: string;
  reqHost: string;
}): Promise<
  Array<{
    calendarEventId: string | null | undefined;
    databaseEventId: string | undefined;
  }>
> => {
  const parsedEvents = parseEvents(events, reqHost);

  const calendar = await getCalendar();
  const createPromises = parsedEvents.map((e) => {
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
    };
  });

  return ids;
};
