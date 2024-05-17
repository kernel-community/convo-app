import _ from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import type { FullCollection } from "src/types";

export default async function collection(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { collectionId } = _.pick(req.body, ["collectionId"]);

  if (!collectionId) {
    throw new Error("collectionId undefined in req.body");
  }

  const collection: FullCollection = await prisma.collection.findUniqueOrThrow({
    where: { id: collectionId },
    include: {
      user: true,
      events: true,
    },
  });

  res.status(200).json({ data: collection });
}
