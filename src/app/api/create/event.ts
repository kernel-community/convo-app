import type { NextApiRequest, NextApiResponse } from "next";
import _, { isNil, pick } from "lodash";
import { prisma } from "src/server/db";
import type { EventType, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { getEventStartAndEnd } from "src/utils/dateTime";
import isProd from "src/utils/isProd";

export type Session = {
  dateTime: Date;
  duration: number;
  count: number;
};
export type ClientEvent = {
  description?: string | undefined;
  title: string;
  sessions: Session[];
  limit: string;
  location: string;
  nickname?: string;
  gCalEvent: boolean;
  email?: string;
  type?: EventType;
  hash?: string;
};

export default async function event(req: NextApiRequest, res: NextApiResponse) {
  const {
    event,
    userId,
  }: {
    event: ClientEvent;
    userId: string;
  } = _.pick(req.body, ["event", "userId", "hash"]);
  const headersList = req.headers;
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);
  const { title, sessions, limit, location, description, type } = event;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const hash = event.hash || nanoid(10);
  const eventPayload: Prisma.Enumerable<Prisma.EventCreateManyInput> =
    sessions.map((session) => {
      const { startDateTime, endDateTime } = getEventStartAndEnd(
        session.dateTime,
        session.duration
      );
      return {
        title,
        descriptionHtml: description,
        startDateTime,
        endDateTime,
        location,
        hash,
        limit: Number(limit),
        proposerId: user.id,
        series: sessions.length > 1,
        type: isProd(host) ? type : "TEST",
      };
    });
  const subdomain = host?.split(".")[0];

  let community = await prisma.community.findUnique({
    where: { subdomain: subdomain },
  });

  if (!community) {
    // @note
    // fallback on kernel community if subdomain not found
    community = await prisma.community.findUnique({
      where: { subdomain: isProd(host) ? "kernel" : "staging" },
    });
  }

  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }

  const createEventsPromises = eventPayload.map((event) =>
    prisma.event.create({
      data: { ...event, communityId: community?.id },
      include: {
        proposer: true,
        community: {
          include: {
            slack: true,
            google: true,
          },
        },
      },
    })
  );
  const created = await Promise.all(createEventsPromises);
  console.log(
    `Created event for ${JSON.stringify(event)} for user: ${user.id}`
  );

  // create events in google calendar
  try {
    await fetch(
      `${
        host?.includes("localhost") ? "http" : "https"
      }://${host}/api/actions/google/createEvent`,
      {
        body: JSON.stringify({ events: created, proposerEmail: user.email }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (err) {
    console.log(`Error in creating google calendar event`);
    console.error(err);
  }

  // send notification on a slack channel
  try {
    await fetch(
      `${
        host?.includes("localhost") ? "http" : "https"
      }://${host}/api/actions/slack/notify`,
      {
        body: JSON.stringify({ eventId: created[0]?.id, type: "new" }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (err) {
    console.log(`Error in sending slack notification`);
    console.error(err);
  }

  return res.status(200).json({ data: created });
}
