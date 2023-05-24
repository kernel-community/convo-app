import { getCalendar } from "./getCalendar";

export const getEvent = async (calendarId: string, eventId: string) => {
  const calendar = await getCalendar();
  return (
    await calendar.events.get({
      calendarId,
      eventId,
    })
  ).data;
};
