// update rsvp
// used to cancel an rsvp

import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";

type RsvpUpdateRequest = {
  address: string;
  eventId: string;
  toRsvp: boolean; // false to remove rsvp, true to add rsvp
};

export default async function rsvp(req: NextApiRequest, res: NextApiResponse) {
  const { rsvp }: { rsvp: RsvpUpdateRequest } = pick(req.body, ["rsvp"]);
  if (!rsvp || !rsvp.address || !rsvp.eventId) {
    throw new Error(`invalid request body: ${JSON.stringify(rsvp)}`);
  }
  const { address, eventId, toRsvp } = rsvp;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      address,
    },
  });
  let result;
  try {
    if (!toRsvp) {
      result = await prisma.rsvp.delete({
        where: {
          eventId_attendeeId: {
            attendeeId: user.id,
            eventId,
          },
        },
      });
    }
    if (toRsvp) {
      result = await prisma.rsvp.upsert({
        where: {
          eventId_attendeeId: {
            attendeeId: user.id,
            eventId,
          },
        },
        create: {
          eventId,
          attendeeId: user.id,
        },
        update: {
          eventId,
          attendeeId: user.id,
        },
      });
    }
  } catch (err) {
    throw err;
  }

  console.log(`RSVP updated: ${JSON.stringify(rsvp)}`);

  res.status(200).json({
    data: result,
  });
}
