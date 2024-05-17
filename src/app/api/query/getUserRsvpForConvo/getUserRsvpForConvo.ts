import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";

const getUserRsvpForConvo = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, hash } = _.pick(req.body, ["userId", "hash"]);
  if (!userId || !hash) {
    throw new Error(`invalid request body: ${JSON.stringify(req.body)}`);
  }

  const rsvps = await prisma.rsvp.findMany({
    where: {
      attendeeId: userId,
      event: { hash },
    },
  });

  res.status(200).json({
    data: {
      rsvps,
    },
  });
};

export default getUserRsvpForConvo;
