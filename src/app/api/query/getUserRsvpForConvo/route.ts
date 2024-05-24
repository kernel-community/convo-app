import _ from "lodash";
import { prisma } from "src/server/db";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, hash } = _.pick(body, ["userId", "hash"]);
  if (!userId || !hash) {
    throw new Error(`invalid request body: ${JSON.stringify(req.body)}`);
  }

  const rsvps = await prisma.rsvp.findMany({
    where: {
      attendeeId: userId,
      event: { hash },
    },
  });

  // res.status(200).json({
  //   data: {
  //     rsvps,
  //   },
  // });
  return NextResponse.json({
    data: { rsvps },
  });
}
