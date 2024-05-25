import _ from "lodash";
import { prisma } from "src/server/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    eventIds,
    userId,
    name,
  }: {
    eventIds: Array<string>;
    userId: string;
    name: string;
  } = _.pick(body, ["eventIds", "userId", "name"]);

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
    `Created collection for ${JSON.stringify(collection)} for user: ${user.id}`
  );

  return NextResponse.json({ data: collection });
}
