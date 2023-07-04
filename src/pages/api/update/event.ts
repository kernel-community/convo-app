/**
 * deletes all sessions if sessions array is empty
 */
import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";
import { ethers } from "ethers";
import { getEventStartAndEnd } from "src/utils/dateTime";
import { ClientEvent, Session } from "../create/event";

export type ClientEditableEvent = Omit<ClientEvent, "sessions"> & {
  sessions: Array<Session & { id: string }>;
} & {
  hash: string;
};

export default async function event(req: NextApiRequest, res: NextApiResponse) {
  const {
    event,
    signature,
    address,
  }: {
    event: ClientEditableEvent;
    signature: string;
    address: string;
  } = _.pick(req.body, ["event", "signature", "address"]);
  const isVerified =
    ethers.utils.verifyMessage(JSON.stringify(event), signature) === address;

  if (!isVerified) {
    throw new Error("Unauthorized: Signature mismatch");
  }
  const { title, sessions, limit, location, description, nickname, hash } =
    event;

  // update nickname
  if (nickname) {
    await prisma.user.update({
      where: { address },
      data: { nickname },
    });
  }

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

  res.status(200).json({
    data: {
      updated,
      deleted,
    },
  });
}
