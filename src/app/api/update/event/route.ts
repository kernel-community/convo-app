/**
 * deletes all sessions if sessions array is empty
 */
import _ from "lodash";
import { prisma } from "src/utils/db";
import { getEventStartAndEnd } from "src/utils/dateTime";
import type { ClientEvent, Session } from "../../create/event/route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export type ClientEditableEvent = Omit<ClientEvent, "sessions"> & {
  sessions: Array<Session & { id: string }>;
} & {
  hash: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    event,
  }: {
    event: ClientEditableEvent;
  } = _.pick(body, ["event"]);
  const headersList = headers();
  const host = headersList.get("host") ?? "kernel";

  const { title, sessions, limit, location, description, hash } = event;

  /**
   *
   * if gCalEventId exists -> remove from google calendar (OR: update summary of the event to be prefixed with `CANCELLED`)
   *
   * [google calendar] for each session -> if gCalEventId exists -> update dateTime, summary, description (+ nickname), location
   *
   */

  const sessionsToUpdate = sessions.map((session) => {
    const { startDateTime, endDateTime } = getEventStartAndEnd(
      session.dateTime,
      session.duration
    );
    return {
      id: session.id,
      startDateTime,
      endDateTime,
    };
  });

  const updateSessionsPromise = sessionsToUpdate.map((session) => {
    const { id, startDateTime, endDateTime } = session;
    return prisma.event.update({
      where: {
        id,
      },
      data: {
        startDateTime,
        endDateTime,
        limit: Number(limit),
        series: sessions.length > 1,
        location,
        descriptionHtml: description,
        title,
      },
      include: {
        proposer: true,
        community: {
          include: {
            google: true,
          },
        },
      },
    });
  });

  // update all sessions date and time according to the given array
  const updated = await Promise.all(updateSessionsPromise);

  // fetch all events for the given hash
  // filter the ids that are not in sessionsToUpdate
  // mark isDeleted = true
  const allEventsForGivenHash = await prisma.event.findMany({
    where: { hash },
  });

  const deletedEvents = allEventsForGivenHash.filter(
    (event) => !sessionsToUpdate.map((s) => s.id).includes(event.id)
  );

  // mark detledEvents as isDeleted = true
  const markIsDeletedPromise = deletedEvents.map((event) => {
    return prisma.event.update({
      where: { id: event.id },
      data: { isDeleted: true },
      include: {
        proposer: true,
      },
    });
  });

  // mark all missing event ids as Deleted
  const deleted = await Promise.all(markIsDeletedPromise);

  console.log(`
    Events updated: ${JSON.stringify(updated)}\n
    Events deleted: ${JSON.stringify(deleted)}
  `);

  console.log(`updating events in gcal`);
  // update events in google calendar
  try {
    await fetch(
      `${
        host?.includes("localhost") ? "http" : "https"
      }://${host}/api/actions/google/updateEvent`,
      {
        body: JSON.stringify({ events: { updated, deleted } }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (err) {
    console.log(`Error in updating/deleting google calendar event`);
    console.error(err);
  }

  return NextResponse.json({
    data: {
      updated,
      deleted,
    },
  });
}
