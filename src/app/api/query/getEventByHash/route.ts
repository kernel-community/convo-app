import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/server/db";
import formatEvent from "src/server/utils/formatEvent";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hash } = _.pick(body, ["hash"]);
  if (!hash) {
    throw new Error("Hash undefined in req.body");
  }
  const event = await prisma.event.findMany({
    where: { hash },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
        },
      },
      collections: true,
      community: {
        include: {
          slack: true,
          google: true,
        },
      },
    },
  });
  const formattedEvent = formatEvent(event);
  return NextResponse.json({ data: formattedEvent });
}
