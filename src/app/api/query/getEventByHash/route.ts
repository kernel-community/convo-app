import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import formatEvent from "src/utils/formatEvent";
import sanitizeEventData from "src/utils/sanitizeEventData";

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

  // Determine if the user is a proposer (admin) for this event
  const isProposer = userId
    ? event.proposers.some((p) => p.userId === userId)
    : false;

  // Sanitize the event data based on user role
  // If the user is a proposer, they get the full event data
  // Otherwise, they get sanitized data with limited personal information
  if (isProposer) {
    // For proposers, format with the original event data
    const formattedEvent = formatEvent([event], userId);
    return NextResponse.json({
      data: {
        ...formattedEvent,
        isProposer: true,
      },
    });
  } else {
    // For non-proposers, sanitize the data first
    const sanitizedEvent = sanitizeEventData(event, false);
    if (!sanitizedEvent) {
      return NextResponse.json(
        { error: "Error processing event data" },
        { status: 500 }
      );
    }

    // Format and return the sanitized event
    const formattedEvent = formatEvent([sanitizedEvent], userId);
    return NextResponse.json({
      data: {
        ...formattedEvent,
        isProposer: false,
      },
    });
  }
}
