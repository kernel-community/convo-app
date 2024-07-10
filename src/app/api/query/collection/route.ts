import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import type { FullCollection } from "src/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { collectionId } = _.pick(body, ["collectionId"]);

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

  // res.status(200).json({ data: collection });
  return NextResponse.json({
    data: collection,
  });
}
