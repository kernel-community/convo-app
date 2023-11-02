import type { NextApiRequest, NextApiResponse } from "next";
import _ from "lodash";
import { prisma } from "src/server/db";

export default async function collection(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    eventIds,
    userId,
    name,
  }: {
    eventIds: Array<string>;
    userId: string;
    name: string;
  } = _.pick(req.body, ["eventIds", "userId", "name"]);

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  // prisma.create collection
  const collection = await prisma.collection.create({
    data: {
      name,
      events: {
        connect: eventIds.map((e) => ({ id: e })),
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  console.log(
    `Created collection for ${JSON.stringify(collection)} for user: ${
      user.address
    }`
  );

  return res.status(200).json({ data: collection });
}
