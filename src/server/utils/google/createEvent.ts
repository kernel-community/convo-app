import { getCalendar } from "./getCalendar";
import type { FullEvent } from "src/app/api/actions/google/createEvent";
import type { calendar_v3 } from "googleapis";
import { isNil } from "lodash";

export const parseEvents = (
  events: Array<FullEvent>,
  reqHost: string
): Array<calendar_v3.Schema$Event & { calendarId: string }> => {
  const protocol = reqHost.includes("localhost") ? "http" : "https";
  const parsed = events.map((event) => {
    if (!event.community.google.calendarId) {
      throw new Error("set google calendar id in database");
    }
    return {
      calendarId: event.community.google.calendarId,
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

export const createEvents = async ({
  events,
  reqHost,
}: {
  events: Array<FullEvent>;
  reqHost: string;
}): Promise<
  Array<{
    calendarEventId: string | null | undefined;
    databaseEventId: string | undefined;
    calendarId: string | null | undefined;
  }>
> => {
  const parsedEvents = parseEvents(events, reqHost);
  const communityId = events[0]?.communityId;
  if (!communityId || isNil(communityId)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }
  const calendar = await getCalendar({ communityId });
  const createPromises = parsedEvents.map((e) => {
    return calendar.events.insert({
      calendarId: e.calendarId,
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
