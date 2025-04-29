import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "src/utils/db";
import _ from "lodash"; // Import lodash
import { getUserIdFromSession } from "src/lib/serverAuth"; // Import the helper

// Input validation schema for POST
// No longer need requestingUserId in schema
const addProposerSchema = z.object({
  eventId: z.string().uuid(),
  newProposerUserId: z.string().uuid(),
  // requestingUserId: z.string().uuid(), // REMOVED
});

export async function POST(request: Request) {
  // Get requesting user ID from session
  const requestingUserId = getUserIdFromSession();

  if (!requestingUserId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // Validate only eventId and newProposerUserId from body
    // const pickedBody = _.pick(body, ["eventId", "newProposerUserId", "requestingUserId"]); REMOVED
    const pickedBody = _.pick(body, ["eventId", "newProposerUserId"]); // UPDATED
    const validation = addProposerSchema.safeParse(pickedBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Use requestingUserId from session, others from validation
    const { eventId, newProposerUserId } = validation.data;

    // 1. Authorization: Check if the requesting user (from session) is a current proposer
    const existingProposer = await prisma.eventProposer.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: requestingUserId,
        },
      },
    });

    if (!existingProposer) {
      return NextResponse.json(
        { error: "Forbidden: Only existing proposers can add co-proposers" },
        { status: 403 }
      );
    }

    // 2. Check if the new proposer user exists
    const newProposerUser = await prisma.user.findUnique({
      where: { id: newProposerUserId },
    });

    if (!newProposerUser) {
      return NextResponse.json(
        { error: "User to add not found" },
        { status: 404 }
      );
    }

    // 3. Check if the user is already a proposer for this event
    const alreadyProposer = await prisma.eventProposer.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: newProposerUserId,
        },
      },
    });

    if (alreadyProposer) {
      // User is already a proposer, return success or specific message
      return NextResponse.json(
        {
          message: "User is already a proposer for this event",
          proposer: alreadyProposer,
        },
        { status: 200 }
      );
    }

    // 4. Create the new EventProposer record
    const newEventProposer = await prisma.eventProposer.create({
      data: {
        eventId: eventId,
        userId: newProposerUserId,
      },
      include: {
        // Optionally include user details in the response
        user: {
          select: { id: true, nickname: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Co-proposer added successfully", proposer: newEventProposer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding co-proposer:", error);
    // Handle potential Prisma errors or other unexpected issues
    if (
      error instanceof Error &&
      error.name === "PrismaClientKnownRequestError"
    ) {
      // Example: Handle specific Prisma errors if necessary
    }
    return NextResponse.json(
      { error: "Failed to add co-proposer" },
      { status: 500 }
    );
  }
}

// Input validation schema for DELETE
// No longer need requestingUserId in schema
const deleteProposerSchema = z.object({
  eventId: z.string().uuid(),
  proposerUserIdToRemove: z.string().uuid(),
  // requestingUserId: z.string().uuid(), // REMOVED
});

export async function DELETE(request: Request) {
  // Get requesting user ID from session
  const requestingUserId = getUserIdFromSession();

  if (!requestingUserId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // Validate only eventId and proposerUserIdToRemove from body
    // const pickedBody = _.pick(body, ["eventId", "proposerUserIdToRemove", "requestingUserId"]); // REMOVED
    const pickedBody = _.pick(body, ["eventId", "proposerUserIdToRemove"]); // UPDATED
    const validation = deleteProposerSchema.safeParse(pickedBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Use requestingUserId from session, others from validation
    const { eventId, proposerUserIdToRemove } = validation.data;

    // 1. Authorization: Check if the requesting user (from session) is a current proposer
    const existingProposer = await prisma.eventProposer.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: requestingUserId,
        },
      },
    });

    if (!existingProposer) {
      return NextResponse.json(
        { error: "Forbidden: Only existing proposers can remove co-proposers" },
        { status: 403 }
      );
    }

    // 2. Check if the user being removed exists as a proposer for this event
    const proposerToRemove = await prisma.eventProposer.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: proposerUserIdToRemove,
        },
      },
    });

    if (!proposerToRemove) {
      return NextResponse.json(
        { error: "Proposer to remove not found for this event" },
        { status: 404 }
      );
    }

    // 3. Prevent removing the last proposer
    const currentProposerCount = await prisma.eventProposer.count({
      where: { eventId: eventId },
    });

    if (currentProposerCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last proposer from an event" },
        { status: 400 }
      );
    }

    // 4. Delete the EventProposer record
    await prisma.eventProposer.delete({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: proposerUserIdToRemove,
        },
      },
    });

    return NextResponse.json(
      { message: "Co-proposer removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing co-proposer:", error);
    return NextResponse.json(
      { error: "Failed to remove co-proposer" },
      { status: 500 }
    );
  }
}
