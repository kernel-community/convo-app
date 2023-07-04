import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { DateTime } from "luxon";
import { prisma } from "src/server/db";
import type { ClientEvent, ServerEvent } from "src/types";
import { formatEvents } from "src/server/utils/formatEvent";
import { Prisma } from "@prisma/client";
import type { EventsRequest } from "src/types";

// now = from where to start fetching; reference
export default async function getEvents(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    now,
    take = 6,
    fromId = "",
    type,
    skip,
    filter,
  }: EventsRequest = _.pick(req.body, [
    "now",
    "take",
    "fromId",
    "type",
    "filter",
  ]);
  const Now = DateTime.fromISO(now as string).toJSDate();
  const tomorrow12Am = DateTime.fromJSDate(Now)
    .plus({ days: 1 })
    .startOf("day")
    .toJSDate();
  const sevenDaysFromNow = DateTime.fromJSDate(Now)
    .plus({ days: 7 })
    .toJSDate();
  const startOfNextMonth = DateTime.fromJSDate(Now)
    .plus({ months: 1 })
    .startOf("month")
    .toJSDate();
  const cursorObj = fromId ? { id: fromId } : undefined;
  const defaultIncludes = {
    take,
    skip,
    cursor: cursorObj,
    include: {
      proposer: true,
      rsvps: true,
    },
    distinct: [Prisma.EventScalarFieldEnum.hash],
  };
  let events: Array<ClientEvent> = [];
  let serverEvents: Array<ServerEvent> = [];
  switch (type) {
    case "live":
      {
        // fetch all live events from 'now'
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              lt: Now,
            },
            endDateTime: {
              gte: Now,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    case "past":
      {
        // fetch all past events
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              lt: Now,
            },
            endDateTime: {
              lt: Now,
            },
          },
          orderBy: {
            startDateTime: "desc",
          },
        });
      }
      break;
    case "upcoming":
      {
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              gt: Now,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    case "today":
      {
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              gte: Now,
            },
            endDateTime: {
              lt: tomorrow12Am,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    case "week":
      {
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              gte: tomorrow12Am,
            },
            endDateTime: {
              lt: sevenDaysFromNow,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    case "month":
      {
        serverEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            startDateTime: {
              gte: Now,
            },
            endDateTime: {
              lt: startOfNextMonth,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    default: {
      throw new Error(`type ${type} invalid`);
    }
  }
  events = formatEvents(serverEvents, filter);

  const lastEvent = events[events.length - 1];
  const nextId = events.length === take && lastEvent ? lastEvent.id : undefined;

  res.status(200).json({
    data: events,
    nextId,
  });
}
