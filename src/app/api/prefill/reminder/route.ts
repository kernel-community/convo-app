import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { EmailType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { reminder } = await req.json();

    // Basic validation
    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder data is required" },
        { status: 400 }
      );
    }

    if (!reminder.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!reminder.eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!reminder.reminderId) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    if (!reminder.type) {
      return NextResponse.json(
        { error: "Email type is required" },
        { status: 400 }
      );
    }

    // Verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: reminder.userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the event exists
    const eventExists = await prisma.event.findUnique({
      where: { id: reminder.eventId },
    });

    if (!eventExists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create reminder (Email)
    const createdReminder = await prisma.email.create({
      data: {
        userId: reminder.userId,
        eventId: reminder.eventId,
        reminderId: reminder.reminderId,
        type: reminder.type,
        sent: reminder.sent || false,
        delivered: reminder.delivered || false,
        bounced: reminder.bounced || false,
        cancelled: reminder.cancelled || false,
      },
      include: {
        user: true,
        event: true,
      },
    });

    // Return the created reminder
    return NextResponse.json(createdReminder);
  } catch (error: any) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create reminder" },
      { status: 500 }
    );
  }
}
