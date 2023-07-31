import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";
import type { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import { getEventStartAndEnd } from "src/utils/dateTime";

// from validationSchema in `components/ProposeForm`

export type Session = {
  dateTime: Date;
  duration: number;
  count: number;
};
export type ClientEvent = {
  description?: string | undefined;
  title: string;
  sessions: Session[];
  limit: string;
  location: string;
  nickname?: string;
  gCalEvent: boolean;
  email?: string;
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

  const {
    title,
    sessions,
    limit,
    location,
    description,
    nickname,
    gCalEvent: gCalEventRequested,
  } = event;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      address,
    },
  });

  // update nickname
  if (nickname) {
    await prisma.user.update({
      where: { address },
      data: { nickname },
    });
  }

  const hash = nanoid(10);
  const eventPayload: Prisma.Enumerable<Prisma.EventCreateManyInput> =
    sessions.map((session) => {
      const { startDateTime, endDateTime } = getEventStartAndEnd(
        session.dateTime,
        session.duration
      );
      return {
        title,
        descriptionHtml: description,
        startDateTime,
        endDateTime,
        location,
        hash,
        limit: Number(limit),
        proposerId: user.id,
        series: sessions.length > 1,
        gCalEventRequested,
      };
    });

  // prisma.create events
  await prisma.event.createMany({
    data: eventPayload,
  });

  console.log(
    `Created event for ${JSON.stringify(event)} for user: ${user.address}`
  );

  const created = await prisma.event.findMany({
    where: { hash },
    include: {
      proposer: true,
    },
  });

  res.status(200).json({ data: created });
}
