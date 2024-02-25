import { getCalendar } from "./getCalendar";

export const getEvent = async ({
  calendarId,
  eventId,
  communityId,
}: {
  calendarId: string;
  eventId: string;
  communityId: string;
}) => {
  const calendar = await getCalendar({ communityId });
  return (
    await calendar.events.get({
      calendarId,
      eventId,
    })
  ).data;
};
