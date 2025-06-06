import _ from "lodash";
import { DateTime } from "luxon";
import { prisma } from "src/utils/db";
import type { ClientEvent, ServerEvent } from "src/types";
import { formatEvents } from "src/utils/formatEvent";
import type { EventType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { EventsRequest } from "src/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rrulestr } from "rrule";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// Helper function to clean up RRULE string for parsing
function cleanupRruleString(rruleString: string): string {
  // Remove any DTSTART component as we'll set it explicitly
  return rruleString.replace(/DTSTART:[^\n]+\n?/i, "");
}

// Helper function to check if a recurring event has future occurrences
// Renamed from hasUpcomingOccurrences to getNextOccurrenceDetails
// Returns the Date of the next occurrence or null
function getNextOccurrenceDetails(
  rruleString: string,
  startDateTime: Date,
  now: Date,
  lookAheadMonths = 6
): Date | null {
  try {
    if (!rruleString) return null;

    // Parse the recurrence rule
    const rruleSetObject = rrulestr(cleanupRruleString(rruleString), {
      dtstart: startDateTime,
    });

    // Set a reasonable future date to check for occurrences
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + lookAheadMonths);

    // Get the next occurrence after now
    // The rrule library's between method returns an array of dates
    // We limit the search by setting inc: true and take: 1 implicitly by checking the first element
    const nextOccurrences = rruleSetObject.between(now, futureDate, true);

    // Return the first occurrence if found
    // Explicitly check the type to satisfy TypeScript
    const firstOccurrence = nextOccurrences[0];
    return firstOccurrence instanceof Date ? firstOccurrence : null;
  } catch (error) {
    // It's better to log the specific event causing the error if possible
    console.error(
      `Error getting next recurrence date for rule "${rruleString}" starting ${startDateTime}:`,
      error
    );
    return null; // Return null on error to avoid breaking the entire request
  }
}

// now = from where to start fetching; reference
export async function POST(request: NextRequest) {
  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();
    console.log(
      `Fetching events for community: ${community.displayName} (${community.subdomain})`
    );

    const req = await request.json();
    console.log({ req });

    if (!req) throw new Error("body not found");
    const {
      now,
      take = 6,
      fromId = "",
      type,
      skip,
      filter,
    }: EventsRequest = _.pick(req, ["now", "take", "fromId", "type", "filter"]);

    // Handle the special userId filter which only shows events proposed by that specific user
    if (filter?.userId) {
      const userId = filter.userId;
      const nickname = filter.nickname || "User";
      console.log(
        `Strictly filtering events proposed ONLY by user: ${nickname} (${userId})`
      );

      const Now = DateTime.fromISO(now as string).toJSDate();
      const defaultIncludes = {
        include: {
          proposers: {
            include: {
              user: {
                include: {
                  profiles: {
                    where: {
                      communityId: community.id,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          rsvps: {
            include: {
              attendee: {
                include: {
                  profiles: {
                    where: {
                      communityId: community.id,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          collections: true,
          community: {
            include: {
              slack: true,
            },
          },
        },
      };

      const defaultWheres = {
        isDeleted: false,
        type: {
          not: "UNLISTED" as EventType,
        },
        communityId: community.id,
        // Add explicit filtering to only include events where this specific user is a proposer
        proposers: {
          some: {
            userId: userId,
          },
        },
      };

      // Properly type the userEvents array to avoid implicit any[]
      let userEvents: ServerEvent[] = [];

      // Handle different event type requests
      if (type === "upcoming") {
        // Get only events the user has proposed
        userEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            ...defaultWheres,
            startDateTime: {
              gte: Now,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      } else if (type === "past") {
        // Get only past events the user has proposed
        userEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            ...defaultWheres,
            endDateTime: {
              lt: Now,
            },
          },
          orderBy: {
            startDateTime: "desc",
          },
        });
      } else {
        // For any other type, default to upcoming events
        console.log(
          `Type "${type}" not specifically handled for user filtering, defaulting to upcoming events logic`
        );

        // Get only events the user has proposed
        userEvents = await prisma.event.findMany({
          ...defaultIncludes,
          where: {
            ...defaultWheres,
            startDateTime: {
              gte: Now,
            },
          },
          orderBy: {
            startDateTime: "asc",
          },
        });
      }

      // No need to sort again since database queries already handle sorting
      /*
      // Sort the combined events with proper type annotation
      userEvents.sort((a: ServerEvent, b: ServerEvent) => {
        if (type === "past") {
          return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
        } else {
          return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        }
      });
      */

      // Apply pagination: skip/take
      const startIndex = skip ?? 0;
      const effectiveTake = take ?? 6;
      const paginatedEvents = userEvents.slice(
        startIndex,
        startIndex + effectiveTake
      );

      // Format and return the events
      const formattedEvents = formatEvents(
        paginatedEvents,
        filter,
        filter.userId
      );

      // Calculate if there are more events for pagination
      const hasMore = userEvents.length > startIndex + effectiveTake;
      const nextId = hasMore
        ? userEvents[startIndex + effectiveTake]?.id
        : null;

      return NextResponse.json({
        data: formattedEvents,
        nextId,
      });
    }

    const Now = DateTime.fromISO(now as string).toJSDate();
    const tomorrow12Am = DateTime.fromJSDate(Now)
      .plus({ days: 1 })
      .startOf("day")
      .toJSDate();
    const sevenDaysFromNow = DateTime.fromJSDate(Now)
      .plus({ days: 7 })
      .toJSDate();
    const twentyEightDaysFromNow = DateTime.fromJSDate(Now)
      .plus({ days: 28 })
      .toJSDate();
    const startOfNextMonth = DateTime.fromJSDate(Now)
      .plus({ months: 1 })
      .startOf("month")
      .toJSDate();
    const cursorObj = fromId ? { id: fromId } : undefined;

    // Add community filter to all queries
    const communityFilter = {
      communityId: community.id,
    };

    const defaultIncludes = {
      take,
      skip,
      cursor: cursorObj,
      include: {
        proposers: {
          include: {
            user: {
              include: {
                profiles: {
                  where: {
                    communityId: community.id,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        rsvps: {
          include: {
            attendee: {
              include: {
                profiles: {
                  where: {
                    communityId: community.id,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        collections: true,
        community: {
          include: {
            slack: true,
          },
        },
      },
      distinct: [Prisma.EventScalarFieldEnum.hash],
    };

    // Add community filter to default wheres
    const defaultWheres = {
      isDeleted: false,
      type: {
        not: "UNLISTED" as EventType,
      },
      ...communityFilter, // Filter by community ID
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
          // Define a reasonable look-ahead period (6 months)
          const lookAheadMonths = 6;

          // First, get all regular upcoming events (non-recurring or recurring with future start dates)
          const upcomingEvents = await prisma.event.findMany({
            // Use default includes but apply pagination later
            include: defaultIncludes.include,
            where: {
              startDateTime: {
                gt: Now,
              },
              ...defaultWheres,
            },
            orderBy: {
              startDateTime: "asc",
            },
            // Remove pagination here, apply after merging and sorting
            // take: defaultIncludes.take,
            // skip: defaultIncludes.skip,
            // cursor: defaultIncludes.cursor,
          });

          // Then, get past recurring events that might have future occurrences
          const pastRecurringEvents = await prisma.event.findMany({
            // Keep includes, but remove pagination as we need to check all potential recurring events
            include: defaultIncludes.include,
            where: {
              startDateTime: {
                lte: Now,
              },
              rrule: {
                not: null,
              },
              ...defaultWheres,
            },
            // Order doesn't strictly matter here anymore for finding occurrences, but keep for consistency
            orderBy: {
              startDateTime: "asc",
            },
            // Remove pagination here as well
          });

          console.log(`Found ${upcomingEvents.length} regular upcoming events`);
          console.log(
            `Found ${pastRecurringEvents.length} past recurring events to check`
          );

          // Array to hold the adjusted future occurrences of past recurring events
          const adjustedRecurringEvents: ServerEvent[] = [];

          for (const event of pastRecurringEvents) {
            if (!event.rrule) continue;

            // Get the date of the *next* occurrence after Now
            const nextOccurrenceDate = getNextOccurrenceDetails(
              event.rrule,
              new Date(event.startDateTime),
              Now,
              lookAheadMonths
            );

            if (nextOccurrenceDate) {
              // If a future occurrence exists, create a modified event object for it
              // Clone the original event to avoid mutating the queried data
              const adjustedEvent = _.cloneDeep(event);

              // Calculate original event duration
              const originalStartTime = new Date(event.startDateTime).getTime();
              // Ensure endDateTime is valid before calculating duration
              const originalEndTime = event.endDateTime
                ? new Date(event.endDateTime).getTime()
                : originalStartTime; // Default to 0 duration if endDateTime is null
              const duration = originalEndTime - originalStartTime; // Duration in milliseconds

              // Update start and end times for the next occurrence
              adjustedEvent.startDateTime = nextOccurrenceDate;
              adjustedEvent.endDateTime =
                duration >= 0
                  ? new Date(nextOccurrenceDate.getTime() + duration)
                  : nextOccurrenceDate; // Handle potential zero or negative duration

              // Add the adjusted event representing the next occurrence
              adjustedRecurringEvents.push(adjustedEvent);
            }
          }

          console.log(
            `Found ${adjustedRecurringEvents.length} future occurrences from past recurring events`
          );

          // Combine regular upcoming events with the *adjusted* future occurrences
          serverEvents = [
            ...upcomingEvents,
            ...adjustedRecurringEvents, // Use the list of adjusted events
          ];

          // Only sort if we have adjusted recurring events, as the upcomingEvents are already sorted
          if (adjustedRecurringEvents.length > 0) {
            // Sort all combined events by their effective start date
            serverEvents.sort((a, b) => {
              // Ensure comparison is done on Date objects
              const aStart = new Date(a.startDateTime);
              const bStart = new Date(b.startDateTime);
              return aStart.getTime() - bStart.getTime();
            });
          }

          // Apply pagination *after* combining and sorting all potential upcoming events
          const startIndex = skip ?? 0;
          const effectiveTake = take ?? 6; // Use the requested take value or default
          serverEvents = serverEvents.slice(
            startIndex,
            startIndex + effectiveTake
          );
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
      case "nextTwentyEightDays":
        {
          serverEvents = await prisma.event.findMany({
            ...defaultIncludes,
            where: {
              startDateTime: {
                gte: Now,
              },
              endDateTime: {
                lt: twentyEightDaysFromNow,
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
        // Sort the events according to the requested time period
        if (filter.collection.when === "past") {
          // For past events, sort in reverse chronological order (newest first)
          serverEvents = serverEvents.sort((a, b) => {
            return (
              new Date(b.startDateTime).getTime() -
              new Date(a.startDateTime).getTime()
            );
          });
        } else {
          // For upcoming events, sort in chronological order (oldest first)
          serverEvents = serverEvents.sort((a, b) => {
            return (
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime()
            );
          });
        }
        break;
      }
      default: {
        throw new Error(`type ${type} invalid`);
      }
    }
    events = formatEvents(serverEvents, filter);
    const lastEvent = events[events.length - 1];
    const nextId =
      events.length === take && lastEvent ? lastEvent.id : undefined;

    return NextResponse.json({
      data: events,
      nextId,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
