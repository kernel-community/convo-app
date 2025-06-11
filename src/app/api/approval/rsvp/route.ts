import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RSVP_TYPE } from "@prisma/client";
import { RSVP_APPROVAL_STATUS } from "@prisma/client";
import type { EmailType } from "src/components/Email";

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
            profiles: true,
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
      // Import the priority queue function
      const { queuePriorityEmail } = await import("src/lib/queue");

      // Transform event to match ServerEvent type (using type assertion for compatibility)
      const serverEvent = {
        ...event,
        collections: [], // Add missing collections property
        community: null, // Add missing community property
      } as any; // Type assertion to bypass strict typing

      // Prepare proposer emails for priority queue
      const proposerEmails = event.proposers
        .filter((p) => p.user.email)
        .map((proposer) => ({
          event: serverEvent,
          type: "approval-requested" as EmailType,
          receiver: {
            id: proposer.user.id,
            email: proposer.user.email,
            address: proposer.user.address,
            nickname: proposer.user.nickname,
            isBeta: proposer.user.isBeta,
            profile: null, // User doesn't have profiles in this context
          },
        }));

      // Queue as priority emails instead of regular emails
      if (proposerEmails.length > 0) {
        await queuePriorityEmail({
          event: serverEvent,
          creatorId: undefined, // No specific creator for approval requests
          proposerEmails: proposerEmails,
          attendeeEmails: [], // No attendee emails for approval requests
        });

        console.log(
          `Queued ${proposerEmails.length} approval request emails as priority`
        );
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
            profiles: true,
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
            profiles: true,
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
        const { queuePriorityEmail } = await import("src/lib/queue");

        const emailType =
          status === "APPROVED" ? "approval-approved" : "approval-rejected";

        // Transform event to match ServerEvent type (using type assertion for compatibility)
        const serverEvent = {
          ...updatedRequest.event,
          collections: [], // Add missing collections property
          community: null, // Add missing community property
        } as any; // Type assertion to bypass strict typing

        // Prepare email for priority queue
        const requesterEmail = {
          event: serverEvent,
          type: emailType as EmailType,
          receiver: {
            id: updatedRequest.user.id,
            email: updatedRequest.user.email,
            address: updatedRequest.user.address,
            nickname: updatedRequest.user.nickname,
            isBeta: updatedRequest.user.isBeta,
            profile: updatedRequest.user.profiles?.[0] || null,
          },
          // For approved requests, include the RSVP type for iCal generation
          approvalRsvpType:
            status === "APPROVED" &&
            ["GOING", "MAYBE", "NOT_GOING"].includes(approvalRequest.rsvpType)
              ? (approvalRequest.rsvpType as "GOING" | "MAYBE" | "NOT_GOING")
              : undefined,
        };

        // Queue as priority email
        await queuePriorityEmail({
          event: serverEvent,
          creatorId: undefined,
          proposerEmails: [], // No proposer emails for responses
          attendeeEmails: [requesterEmail], // Send to the requester
        });

        console.log(
          `Queued approval ${status.toLowerCase()} email as priority`
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
            profiles: true,
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
