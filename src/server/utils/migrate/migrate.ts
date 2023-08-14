/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { prisma } from "../../db";
import { data } from "./data";

export const migrate = async () => {
  const events = data.data;
  let allCreated = [];
  const allCreatedPromises = [];
  for (let i = 0; i < events.length; i++) {
    const {
      id,
      hash,
      title,
      descriptionHtml,
      startDateTime,
      endDateTime,
      location,
      limit,
      proposerEmail,
      proposer,
      series,
      GoogleCalendar,
      RSVP,
    } = events[i]!;
    const gcal = GoogleCalendar[0]!;
    allCreatedPromises.push(
      prisma.event.upsert({
        where: { id: id.toString() },
        create: {
          id: id.toString(),
          title,
          descriptionHtml,
          startDateTime,
          endDateTime,
          location,
          hash,
          limit,
          type: "JUNTO",
          isImported: true,
          proposer: {
            connectOrCreate: {
              where: {
                address: proposerEmail,
              },
              create: {
                nickname: proposer.username,
                address: proposerEmail,
              },
            },
          },
          series,
          gCalEventRequested: !!gcal,
          gCalEventId: gcal ? gcal?.gCalEventId : undefined,
          gCalId: gcal ? gcal?.gCalCalendarId : undefined,
          emails: RSVP.map((r: { attendeeEmail: string }) => r.attendeeEmail),
        },
        update: {},
        select: { id: true },
      })
    );
  }
  allCreated = await Promise.all(allCreatedPromises);
  return allCreated;
};
