import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendInvite } from "src/server/utils/google/sendInvite";
import { prisma } from "src/server/db";

export default async function sendInviteHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { events, email }: { events: Array<string>; email: string } = pick(
    req.body,
    ["events", "email"]
  );

  if (!events || !email) {
    throw new Error("`events` and/or `email` not found in req.body");
  }

  await sendInvite({
    events,
    attendeeEmail: email,
  });

  for (let i = 0; i < events.length; i++) {
    const userId = await prisma.user.findUnique({ where: { email } });
    if (!userId) {
      break;
    }
    try {
      await prisma.rsvp.update({
        where: {
          eventId_attendeeId: {
            eventId: events[i] as string,
            attendeeId: userId?.id,
          },
        },
        data: {
          isAddedToGoogleCalendar: true,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  return res.status(200).json({
    data: true,
  });
}
