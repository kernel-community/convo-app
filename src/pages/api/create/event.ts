import type { NextApiRequest, NextApiResponse } from "next";
import _, { pick } from "lodash";
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
  const {
    title,
    sessions,
    limit,
    location,
    description,
    gCalEvent: gCalEventRequested,
    type,
  } = event;

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
        gCalEventRequested,
        type: isProd(host) ? type : "TEST",
      };
    });
  const subdomain = host?.split(".")[0];
  const community = await prisma.community.findUnique({
    where: { subdomain: subdomain },
  });
  const connectCommmunity = community
    ? { connect: { id: community?.id } }
    : undefined;
  const createEventsPromises = eventPayload.map((event) =>
    prisma.event.create({
      data: { ...event, communities: connectCommmunity },
      include: {
        proposer: true,
      },
    })
  );
  const created = await Promise.all(createEventsPromises);
  console.log(
    `Created event for ${JSON.stringify(event)} for user: ${user.id}`
  );
  return res.status(200).json({ data: created });
}
