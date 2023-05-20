import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";
import type { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { ethers } from "ethers";

// from validationSchema in `components/ProposeForm`
type ClientEvent = {
  description?: string | undefined;
  title: string;
  sessions: {
    dateTime: Date;
    duration: number;
    count: number;
  }[];
  limit: string;
  location: string;
  nickname?: string;
  gCalEvent: boolean;
};

export default async function event(req: NextApiRequest, res: NextApiResponse) {
  const {
    event,
    signature,
    address,
  }: {
    event: ClientEvent;
    signature: string;
    address: string;
  } = _.pick(req.body, ["event", "signature", "address"]);
  const isVerified =
    ethers.utils.verifyMessage(JSON.stringify(event), signature) === address;

  if (!isVerified) {
    throw new Error("Unauthorized: Signature mismatch");
  }

  const { title, sessions, limit, location, description, nickname, gCalEvent } =
    event;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      address,
    },
  });

  // update nickname
  await prisma.user.update({
    where: { address },
    data: { nickname },
  });

  // is gcal event creation requested?
  let gCalEventId: undefined | string = undefined;
  if (gCalEvent) {
    // create google calendar event here
    // set gCalEventId if successfully created
    gCalEventId = "000000";
    // throw error if not successful - exit out of this API
  }

  const hash = nanoid(10);
  const eventPayload: Prisma.Enumerable<Prisma.EventCreateManyInput> =
    sessions.map((session) => {
      return {
        title,
        descriptionHtml: description,
        startDateTime: new Date(session.dateTime),
        endDateTime: new Date(), // @todo,
        location,
        hash,
        limit: Number(limit),
        proposerId: user.id,
        series: sessions.length > 1,
        gCalEventId,
      };
    });

  // prisma.create events
  await prisma.event.createMany({
    data: eventPayload,
  });

  console.log(
    `Created event for ${JSON.stringify(event)} for user: ${user.address}`
  );

  res.status(200).json({ data: event });
}
