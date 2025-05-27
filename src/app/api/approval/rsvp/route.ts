import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RSVP_TYPE } from "@prisma/client";
import { RSVP_APPROVAL_STATUS } from "@prisma/client";
import { sendEventEmail } from "src/utils/email/send";

type CreateApprovalRequestBody = {
  userId: string;
  eventId: string;
  rsvpType: RSVP_TYPE;
  message?: string;
};

type UpdateApprovalRequestBody = {
  requestId: string;
  status: "APPROVED" | "REJECTED";
  reviewedBy: string;
  reviewMessage?: string;
};

/**
 * POST - Create new approval request
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, eventId, rsvpType, message }: CreateApprovalRequestBody =
      _.pick(body, ["userId", "eventId", "rsvpType", "message"]);

    if (!userId || !eventId || !rsvpType) {
      return NextResponse.json(
        { error: "userId, eventId, and rsvpType are required" },
        { status: 400 }
      );
    }

    // Validate that the event exists and requires approval
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        proposers: {
          include: {
            user: true,
          },
        },
        rsvps: {
          include: {
            attendee: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.requiresApproval) {
      return NextResponse.json(
        { error: "This event does not require approval" },
        { status: 400 }
      );
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an RSVP
    const existingRsvp = await prisma.rsvp.findUnique({
      where: {
        eventId_attendeeId: {
          eventId,
          attendeeId: userId,
        },
      },
    });

    if (existingRsvp) {
      return NextResponse.json(
        { error: "User already has an RSVP for this event" },
        { status: 400 }
      );
    }

    // Check if user already has a pending approval request
    const existingRequest = await prisma.rsvpApprovalRequest.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingRequest) {
      // Only block if there's already a pending request
      if (existingRequest.status === RSVP_APPROVAL_STATUS.PENDING) {
        return NextResponse.json(
          {
            error: "You already have a pending approval request for this event",
          },
          { status: 400 }
        );
      }

      // For approved requests, user should already have an RSVP (checked above)
      // For rejected requests, allow new request by deleting the old one
      if (existingRequest.status === RSVP_APPROVAL_STATUS.REJECTED) {
        await prisma.rsvpApprovalRequest.delete({
          where: { id: existingRequest.id },
        });
      }
    }

    // Create the approval request
    const approvalRequest = await prisma.rsvpApprovalRequest.create({
      data: {
        eventId,
        userId,
        rsvpType,
        message,
        status: RSVP_APPROVAL_STATUS.PENDING,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        event: {
          include: {
            proposers: {
              include: {
                user: true,
              },
            },
            rsvps: {
              include: {
                attendee: true,
              },
            },
          },
        },
      },
    });

    // Send notification emails to proposers
    try {
      const proposerEmails = event.proposers
        .map((p) => p.user.email)
        .filter((email) => email) as string[];

      for (const proposer of event.proposers) {
        if (proposer.user.email) {
          sendEventEmail({
            receiver: proposer.user,
            type: "approval-requested",
            event: event,
          }).catch((error) =>
            console.error(
              `Error sending approval request email to ${proposer.user.email}: ${error?.message}`
            )
          );
        }
      }
    } catch (emailError) {
      console.error("Error sending notification emails:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      data: {
        id: approvalRequest.id,
        status: approvalRequest.status,
        message: "Approval request created successfully",
      },
    });
  } catch (error) {
    console.error("[api/approval/rsvp] POST Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update approval request status (approve/reject)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestId,
      status,
      reviewedBy,
      reviewMessage,
    }: UpdateApprovalRequestBody = _.pick(body, [
      "requestId",
      "status",
      "reviewedBy",
      "reviewMessage",
    ]);

    if (!requestId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: "requestId, status, and reviewedBy are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or REJECTED" },
        { status: 400 }
      );
    }

    // Find the approval request
    const approvalRequest = await prisma.rsvpApprovalRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        event: {
          include: {
            proposers: {
              include: {
                user: true,
              },
            },
            rsvps: {
              include: {
                attendee: true,
              },
            },
          },
        },
      },
    });

    if (!approvalRequest) {
      return NextResponse.json(
        { error: "Approval request not found" },
        { status: 404 }
      );
    }

    // Check if the reviewer is a proposer of the event
    const isProposer = approvalRequest.event.proposers.some(
      (p) => p.userId === reviewedBy
    );

    if (!isProposer) {
      return NextResponse.json(
        { error: "Only event proposers can approve or reject requests" },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (approvalRequest.status !== RSVP_APPROVAL_STATUS.PENDING) {
      return NextResponse.json(
        { error: "This request has already been reviewed" },
        { status: 400 }
      );
    }

    // Update the approval request
    const updatedRequest = await prisma.rsvpApprovalRequest.update({
      where: { id: requestId },
      data: {
        status: status as RSVP_APPROVAL_STATUS,
        reviewedBy,
        reviewedAt: new Date(),
        reviewMessage,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        event: {
          include: {
            proposers: {
              include: {
                user: true,
              },
            },
            rsvps: {
              include: {
                attendee: true,
              },
            },
          },
        },
      },
    });

    // If approved, create the actual RSVP
    if (status === "APPROVED") {
      try {
        await prisma.rsvp.create({
          data: {
            eventId: approvalRequest.eventId,
            attendeeId: approvalRequest.userId,
            rsvpType: approvalRequest.rsvpType,
          },
        });

        // Increment event sequence for calendar updates
        await prisma.event.update({
          where: { id: approvalRequest.eventId },
          data: { sequence: { increment: 1 } },
        });
      } catch (rsvpError) {
        console.error("Error creating RSVP after approval:", rsvpError);
        // Revert the approval request status if RSVP creation fails
        await prisma.rsvpApprovalRequest.update({
          where: { id: requestId },
          data: {
            status: RSVP_APPROVAL_STATUS.PENDING,
            reviewedBy: null,
            reviewedAt: null,
            reviewMessage: null,
          },
        });

        return NextResponse.json(
          { error: "Failed to create RSVP after approval" },
          { status: 500 }
        );
      }
    }

    // Send notification email to the requester
    try {
      if (updatedRequest.user.email) {
        const emailType =
          status === "APPROVED" ? "approval-approved" : "approval-rejected";
        sendEventEmail({
          receiver: updatedRequest.user,
          type: emailType,
          event: updatedRequest.event,
        }).catch((error) =>
          console.error(
            `Error sending approval ${status.toLowerCase()} email: ${
              error?.message
            }`
          )
        );
      }
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        message: `Request ${status.toLowerCase()} successfully`,
      },
    });
  } catch (error) {
    console.error("[api/approval/rsvp] PUT Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

/**
 * GET - Get approval requests for event or user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!eventId && !userId) {
      return NextResponse.json(
        { error: "Either eventId or userId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {};

    if (eventId) {
      whereClause.eventId = eventId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (status) {
      whereClause.status = status as RSVP_APPROVAL_STATUS;
    }

    const approvalRequests = await prisma.rsvpApprovalRequest.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            hash: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            nickname: true,
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
    console.error("[api/approval/rsvp] GET Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
