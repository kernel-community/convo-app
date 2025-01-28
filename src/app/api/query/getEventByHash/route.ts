import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import formatEvent from "src/utils/formatEvent";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hash } = _.pick(body, ["hash"]);
  if (!hash) {
    return NextResponse.json({ error: "Hash is required" }, { status: 400 });
  }

  const event = await prisma.event.findFirst({
    where: { hash },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: {
            include: {
              profile: true,
            },
          },
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

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const formattedEvent = formatEvent([event]);
  return NextResponse.json({ data: formattedEvent });
}
