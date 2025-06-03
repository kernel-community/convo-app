import { NextRequest, NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import formatEvent from "src/utils/formatEvent";
import { DateTime } from "luxon";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    const now = new Date();

    // Common include options for both queries
    const includeOptions = {
      proposers: {
        include: {
          user: {
            include: {
              profiles: {
                where: { communityId: community.id },
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
                where: { communityId: community.id },
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
    };

    // Common where clause for both queries
    const baseWhereClause = {
      isDeleted: false,
    };

    // Fetch events proposed by the user
    const proposedEvents = await prisma.event.findMany({
      where: {
        ...baseWhereClause,
        proposers: {
          some: {
            userId,
          },
        },
      },
      include: includeOptions,
      orderBy: {
        startDateTime: "desc",
      },
      take: 10,
    });

    // Fetch events the user is attending (has RSVPed to)
    const attendingEvents = await prisma.event.findMany({
      where: {
        ...baseWhereClause,
        rsvps: {
          some: {
            attendeeId: userId,
            rsvpType: "GOING",
          },
        },
        // Exclude events the user has proposed to avoid duplication
        proposers: {
          none: {
            userId,
          },
        },
      },
      include: includeOptions,
      orderBy: {
        startDateTime: "desc",
      },
      take: 10,
    });

    // Format the events
    const formattedProposedEvents = proposedEvents.map((event) =>
      formatEvent([event], userId)
    );
    const formattedAttendingEvents = attendingEvents.map((event) =>
      formatEvent([event], userId)
    );

    return NextResponse.json({
      data: {
        proposed: formattedProposedEvents,
        attending: formattedAttendingEvents,
      },
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: "Failed to fetch user events" },
      { status: 500 }
    );
  }
}
