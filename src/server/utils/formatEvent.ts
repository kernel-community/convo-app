import type { ClientEvent, ServerEvent } from "src/types";
import totalUniqueRSVPs from "src/utils/totalUniqueRsvps";

const formatEvent = (event: Array<ServerEvent>): ClientEvent => {
  const firstInSeries = event[0];
  if (!firstInSeries) {
    throw new Error("firstInSeries undefined");
  }
  const { startDateTime, endDateTime } = firstInSeries;

  return {
    ...firstInSeries,
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    totalUniqueRsvps: totalUniqueRSVPs(event),
    sessions: event.map((e) => {
      const { id, startDateTime, endDateTime, limit, Rsvp } = e;
      return {
        id,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        limit,
        Rsvp,
        rsvpCount: Rsvp.length,
        availableSeats: limit - Rsvp.length > 0 ? limit - Rsvp.length : 0,
        noLimit: limit === 0,
      };
    }),
  };
};

export default formatEvent;
