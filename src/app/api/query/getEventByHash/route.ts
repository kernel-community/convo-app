import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import formatEvent from "src/utils/formatEvent";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hash, userId } = _.pick(body, ["hash", "userId"]);
  if (!hash) {
    return NextResponse.json({ error: "Hash is required" }, { status: 400 });
  }

  const event = await prisma.event.findFirst({
    where: {
      hash,
      isDeleted: false,
    },
    include: {
      proposers: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
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
        },
      },
      _count: {
        select: { waitlist: true },
      },
      waitlist: {
        where: {
          userId: userId || undefined,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const formattedEvent = formatEvent([event], userId);
  return NextResponse.json({ data: formattedEvent });
}
