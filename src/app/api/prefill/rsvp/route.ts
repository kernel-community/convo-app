import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RSVP_TYPE } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { rsvp } = await req.json();

    // Basic validation
    if (!rsvp) {
      return NextResponse.json(
        { error: "RSVP data is required" },
        { status: 400 }
      );
    }

    if (!rsvp.eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if we have either attendeeId or attendeeEmail
    if (!rsvp.attendeeId && !rsvp.attendeeEmail) {
      return NextResponse.json(
        { error: "Either Attendee ID or Attendee Email is required" },
        { status: 400 }
      );
    }

    // Verify the event exists
    const eventExists = await prisma.event.findUnique({
      where: { id: rsvp.eventId },
    });

    if (!eventExists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find the user either by ID or email
    let userToRsvp;

    if (rsvp.attendeeId) {
      // Find user by ID
      userToRsvp = await prisma.user.findUnique({
        where: { id: rsvp.attendeeId },
      });
    } else if (rsvp.attendeeEmail) {
      // Find user by email
      userToRsvp = await prisma.user.findUnique({
        where: { email: rsvp.attendeeEmail },
      });

      // If user not found, create a new one
      if (!userToRsvp) {
        userToRsvp = await prisma.user.create({
          data: {
            email: rsvp.attendeeEmail,
            nickname: rsvp.attendeeEmail.split("@")[0], // Use part before @ as nickname
          },
        });
      }
    }

    if (!userToRsvp) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if RSVP already exists
    const existingRsvp = await prisma.rsvp.findUnique({
      where: {
        eventId_attendeeId: {
          eventId: rsvp.eventId,
          attendeeId: userToRsvp.id,
        },
      },
    });

    let createdOrUpdatedRsvp;

    if (existingRsvp) {
      // Update existing RSVP
      createdOrUpdatedRsvp = await prisma.rsvp.update({
        where: {
          eventId_attendeeId: {
            eventId: rsvp.eventId,
            attendeeId: userToRsvp.id,
          },
        },
        data: {
          rsvpType: rsvp.rsvpType,
          updatedAt: new Date(),
        },
        include: {
          event: true,
          attendee: true,
        },
      });
    } else {
      // Create new RSVP
      createdOrUpdatedRsvp = await prisma.rsvp.create({
        data: {
          eventId: rsvp.eventId,
          attendeeId: userToRsvp.id,
          rsvpType: rsvp.rsvpType || RSVP_TYPE.GOING,
        },
        include: {
          event: true,
          attendee: true,
        },
      });
    }

    // Return the created RSVP
    return NextResponse.json(createdOrUpdatedRsvp);
  } catch (error: any) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create RSVP" },
      { status: 500 }
    );
  }
}
