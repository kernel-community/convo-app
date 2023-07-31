/**
 * accepts an array of events of type FullEvent (see below)
 * creates google calendar events for each
 * irrespective of existing gCalEventId in the database
 * can also be called externally
 * either via an action button or as a database trigger (for rows with gCalEventRequested == true)
 */

import type { Event, User } from "@prisma/client";
import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { createEvents } from "src/server/utils/google/createEvent";
import { prisma } from "src/server/db";
import { sendInvite } from "src/server/utils/google/sendInvite";

export type FullEvent = Event & {
  proposer: User;
};

export default async function createEventHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headersList = req.headers;
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);

  const {
    events,
    proposerEmail,
  }: { events: Array<FullEvent>; proposerEmail: string } = pick(req.body, [
    "events",
    "proposerEmail",
  ]);

  if (!events) {
    throw new Error("`event` not found in req.body");
  }

  const prodHost = process.env.PROD_HOST;
  if (!prodHost) {
    throw new Error("set prodHost in .env -- the host of the app in prod");
  }
  const isProd = host === prodHost;

  const calendarId = isProd
    ? process.env.CONVO_PROD_CALENDAR_ID
    : process.env.TEST_CALENDAR_ID;

  if (!calendarId) {
    throw new Error(`
      Calendar ID not defined in .env. Expecting CONVO_PROD_CALENDAR_ID or TEST_CALENDAR_ID
    `);
  }

  const ids = await createEvents({
    calendarId,
    events,
    reqHost: host || prodHost,
  });

  const updatePromises = ids.map((id) => {
    return prisma.event.update({
      where: { id: id.databaseEventId },
      data: {
        gCalEventId: id.calendarEventId,
        gCalId: calendarId,
      },
    });
  });

  const updated = await Promise.all(updatePromises);

  // send calendar invites to the proposer
  if (proposerEmail) {
    const eventIds = updated.map((e) => e.id);
    await sendInvite({
      events: eventIds,
      attendeeEmail: proposerEmail,
    });
    console.log(`
      Sent google calendar invites to the proposer ${proposerEmail}
    `);
  }

  console.log(`
    Created google calendar events for ${JSON.stringify(updated)}
  `);

  res.status(200).json({
    data: updated,
  });
}
