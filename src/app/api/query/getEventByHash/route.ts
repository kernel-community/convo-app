import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import formatEvent from "src/utils/formatEvent";
import sanitizeEventData from "src/utils/sanitizeEventData";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hash, userId } = _.pick(body, ["hash", "userId"]);
  if (!hash) {
    return NextResponse.json({ error: "Hash is required" }, { status: 400 });
  }

  // Get the community for the current subdomain
  const community = await getCommunityFromSubdomain();

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
              profiles: {
                where: {
                  communityId: community.id,
                },
                take: 1,
              },
            },
          },
        },
      },
      rsvps: {
        include: {
          attendee: {
            include: {
              profiles: {
                where: {
                  communityId: community.id,
                },
                take: 1,
              },
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
        select: {
          waitlist: true,
          approvalRequests: true,
        },
      },
      waitlist: {
        where: {
          userId: userId || undefined,
        },
      },
      approvalRequests: {
        where: {
          userId: userId || undefined,
        },
        include: {
          user: {
            include: {
              profiles: {
                where: {
                  communityId: community.id,
                },
                take: 1,
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              nickname: true,
            },
          },
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
    const formattedEvent = formatEvent([event as any], userId);
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
    const formattedEvent = formatEvent([sanitizedEvent as any], userId);
    return NextResponse.json({
      data: {
        ...formattedEvent,
        isProposer: false,
      },
    });
  }
}
