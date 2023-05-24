import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { sendInvite } from "src/server/utils/google/sendInvite";

export default async function sendInviteHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headersList = req.headers;
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);

  const { events, email }: { events: Array<string>; email: string } = pick(
    req.body,
    ["events", "email"]
  );

  if (!events || !email) {
    throw new Error("`events` and/or `email` not found in req.body");
  }

  const prodHost = process.env.PROD_HOST;
  if (!prodHost) {
    throw new Error("set prodHost in .env -- the host of the app in prod");
  }
  const isProd = host === prodHost;

  const calendarId = isProd
    ? process.env.CONVO_PROD_CALENDAR_ID
    : process.env.TEST_CALENDAR_ID;

  if (!calendarId) {
    throw new Error(`
      Calendar ID not defined in .env. Expecting CONVO_PROD_CALENDAR_ID or TEST_CALENDAR_ID
    `);
  }

  await sendInvite({
    events,
    attendeeEmail: email,
  });

  return res.status(200).json({
    data: true,
  });
}
