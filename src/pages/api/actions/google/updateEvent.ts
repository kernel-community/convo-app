import type { Event, User } from "@prisma/client";
import { pick } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { updateEvents } from "src/server/utils/google/updateEvents";

export type FullEvent = Event & {
  proposer: User;
};

export default async function createEventHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headersList = req.headers;
  const { host }: { host?: string | undefined | string[] } = pick(headersList, [
    "host",
  ]);

  const {
    events,
  }: { events: { updated: Array<FullEvent>; deleted: Array<FullEvent> } } =
    pick(req.body, ["events"]);

  if (!events) {
    throw new Error("`event` not found in req.body");
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

  const ids = await updateEvents({
    calendarId,
    events,
    reqHost: host || prodHost,
  });

  res.status(200).json({
    data: ids,
  });
}
