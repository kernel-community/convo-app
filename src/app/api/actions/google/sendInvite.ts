import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendInvite } from "src/server/utils/google/sendInvite";

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

  return res.status(200).json({
    data: true,
  });
}
