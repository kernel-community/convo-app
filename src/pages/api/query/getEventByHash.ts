import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import formatEvent from "src/server/utils/formatEvent";

export default async function getEventByHash(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { hash } = _.pick(req.body, ["hash"]);
  if (!hash) {
    throw new Error("Hash undefined in req.body");
  }
  const event = await prisma.event.findMany({
    where: { hash },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
        },
      },
      collections: true,
    },
  });
  const formattedEvent = formatEvent(event);
  res.status(200).json({ data: formattedEvent });
}
