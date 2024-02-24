/**
 * accepts an array of events of type FullEvent (see below)
 * creates google calendar events for each
 * irrespective of existing gCalEventId in the database
 * can also be called externally
 * either via an action button or as a database trigger (for rows with gCalEventRequested == true)
 */
import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { createEvents } from "src/server/utils/google/createEvent";
import { prisma } from "src/server/db";
import { sendInvite } from "src/server/utils/google/sendInvite";
import { DEFAULT_HOST } from "src/utils/constants";
import type { Community, Event, Google, Slack, User } from "@prisma/client";

export type FullEvent = Event & {
  proposer: User;
  community: Community & {
    google: Google;
    slack: Slack;
  };
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

  const ids = await createEvents({
    events,
    reqHost: host || DEFAULT_HOST,
  });

  const updatePromises = ids.map((id) => {
    return prisma.event.update({
      where: { id: id.databaseEventId },
      data: {
        gCalEventId: id.calendarEventId,
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
