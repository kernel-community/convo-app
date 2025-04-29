import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { slackMessage } = await req.json();

    // Basic validation
    if (!slackMessage) {
      return NextResponse.json(
        { error: "Slack message data is required" },
        { status: 400 }
      );
    }

    if (!slackMessage.eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!slackMessage.slackId) {
      return NextResponse.json(
        { error: "Slack ID is required" },
        { status: 400 }
      );
    }

    if (!slackMessage.ts) {
      return NextResponse.json(
        { error: "Timestamp (ts) is required" },
        { status: 400 }
      );
    }

    // Verify the event exists
    const eventExists = await prisma.event.findUnique({
      where: { id: slackMessage.eventId },
    });

    if (!eventExists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify the slack exists
    const slackExists = await prisma.slack.findUnique({
      where: { id: slackMessage.slackId },
    });

    if (!slackExists) {
      return NextResponse.json({ error: "Slack not found" }, { status: 404 });
    }

    // Check if a message with this eventId and slackId already exists
    const existingMessage = await prisma.postedSlackMessage.findUnique({
      where: {
        eventId_slackId: {
          eventId: slackMessage.eventId,
          slackId: slackMessage.slackId,
        },
      },
    });

    if (existingMessage) {
      return NextResponse.json(
        { error: "A message for this event and slack already exists" },
        { status: 400 }
      );
    }

    // Create PostedSlackMessage
    const createdMessage = await prisma.postedSlackMessage.create({
      data: {
        eventId: slackMessage.eventId,
        slackId: slackMessage.slackId,
        ts: slackMessage.ts,
      },
      include: {
        event: true,
        slack: true,
      },
    });

    // Return the created message
    return NextResponse.json(createdMessage);
  } catch (error: any) {
    console.error("Error creating slack message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create slack message" },
      { status: 500 }
    );
  }
}
