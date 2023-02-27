import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";
import type { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { ethers } from "ethers";

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
  nickname: string;
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

  const { title, sessions, limit, location, description, nickname } = event;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      address,
    },
  });

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
        nickname,
      };
    });

  // prisma.create events
  await prisma.event.createMany({
    data: eventPayload,
  });

  res.status(200).json({ data: event });
}
