import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";

const getUserRsvpForEvent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, event } = _.pick(req.body, ["userId", "event"]);
  console.log({ userId, event });
  if (!userId || !event) {
    throw new Error(`invalid request body: ${JSON.stringify(req.body)}`);
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const rsvp = await prisma.rsvp.findUnique({
    where: {
      eventId_attendeeId: {
        eventId: event,
        attendeeId: user.id,
      },
    },
  });

  res.status(200).json({
    data: {
      isRsvp: !!rsvp,
    },
  });
};

export default getUserRsvpForEvent;
