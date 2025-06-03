import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RSVP_APPROVAL_STATUS } from "@prisma/client";

/**
 * POST - Get pending approval requests for events where user is proposer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = _.pick(body, ["userId"]);

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Find all events where the user is a proposer
    const proposerEvents = await prisma.eventProposer.findMany({
      where: {
        userId: userId,
      },
      select: {
        eventId: true,
      },
    });

    const eventIds = proposerEvents.map((pe) => pe.eventId);

    if (eventIds.length === 0) {
      return NextResponse.json({
        data: [],
      });
    }

    // Get all pending approval requests for these events
    const approvalRequests = await prisma.rsvpApprovalRequest.findMany({
      where: {
        eventId: {
          in: eventIds,
        },
        status: RSVP_APPROVAL_STATUS.PENDING,
      },
      include: {
        user: {
          include: {
            profiles: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            hash: true,
            limit: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: approvalRequests,
    });
  } catch (error) {
    console.error("[api/query/getApprovalRequests] Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
