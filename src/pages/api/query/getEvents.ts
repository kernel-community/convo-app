import type { NextApiRequest, NextApiResponse } from "next";
import _, { isNil } from "lodash";
import { DateTime } from "luxon";
import { prisma } from "src/server/db";
import type { ClientEvent, ServerEvent } from "src/types";
import { formatEvents } from "src/server/utils/formatEvent";
import type { EventType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { EventsRequest } from "src/types";

// now = from where to start fetching; reference
export default async function getEvents(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const hostname = req.headers.host;
  const subdomain = hostname?.split(".")[0];
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
      rsvps: {
        include: {
          attendee: true,
        },
      },
      collections: true,
      community: {
        include: {
          slack: true,
          google: true,
        },
      },
    },
    distinct: [Prisma.EventScalarFieldEnum.hash],
  };
  // check if subdomain is "registered" in our databse
  // if it is, create communities object accordingly
  // if not, return all events
  let community = await prisma.community.findUnique({ where: { subdomain } });
  if (!community) {
    // @note
    // fallback on kernel community if subdomain not found
    community = await prisma.community.findUnique({
      where: { subdomain: "kernel" },
    });
  }
  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }
  const defaultWheres = {
    isDeleted: false,
    type: {
      not: "INTERVIEW" as EventType,
    },
    community: { id: community?.id },
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
            ...defaultWheres,
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
            ...defaultWheres,
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
            ...defaultWheres,
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
            ...defaultWheres,
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
            ...defaultWheres,
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
            ...defaultWheres,
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }
      break;
    case "collection": {
      // special category
      if (!filter?.collection) {
        throw new Error("Collection ID not provided for type collection");
      }
      let collection;
      if (filter.collection.when === "past") {
        collection = await prisma.collection.findUniqueOrThrow({
          where: {
            id: filter.collection.id,
          },
          include: {
            events: {
              ...defaultIncludes,
              where: {
                startDateTime: {
                  lt: Now,
                },
                endDateTime: {
                  lt: Now,
                },
              },
            },
          },
        });
      }
      if (filter.collection.when === "upcoming") {
        collection = await prisma.collection.findUniqueOrThrow({
          where: {
            id: filter.collection.id,
          },
          include: {
            events: {
              ...defaultIncludes,
              where: {
                startDateTime: {
                  gt: Now,
                },
              },
            },
          },
        });
      }
      if (!collection) {
        throw new Error("`when` needs to be either `upcoming` or `past`");
      }
      serverEvents = collection.events;
      serverEvents = serverEvents.sort((a, b) => {
        const aStart = new Date(a.startDateTime);
        const bStart = new Date(b.startDateTime);
        if (aStart < bStart) return -1;
        if (aStart < bStart) return 1;
        else return 0;
      });
      break;
    }
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
