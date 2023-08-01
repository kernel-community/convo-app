/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { prisma } from "../../db";
import { data } from "./data";

export const migrate = async () => {
  const events = data.data;
  const allCreated: string[] = [];
  for (let i = 0; i < events.length; i++) {
    const {
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
    const alreadyExists = await prisma.event.findFirst({
      where: { hash },
    });

    if (alreadyExists) continue;
    const gcal = GoogleCalendar[0]!;
    const created = await prisma.event.create({
      data: {
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
    });
    allCreated.push(created.id);
  }
  return allCreated;
};
