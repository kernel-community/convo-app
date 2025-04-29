import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { event } = await req.json();

    // Basic validation
    if (!event) {
      return NextResponse.json(
        { error: "Event data is required" },
        { status: 400 }
      );
    }

    if (!event.title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    if (!event.startDateTime || !event.endDateTime) {
      return NextResponse.json(
        { error: "Event start and end dates are required" },
        { status: 400 }
      );
    }

    // Ensure we have a hash
    const hash = event.hash || nanoid(10);

    // Prepare the data for the database
    const eventData = {
      title: event.title,
      descriptionHtml: event.descriptionHtml,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
      location: event.location || "",
      locationType: event.locationType,
      limit: Number(event.limit) || 0,
      hash: hash,
      rrule: event.rrule || null,
      type: event.type,
      communityId: "6972ebcc-8dc5-4bf4-8e0c-322d648b0710", // kernel community
      creationTimezone:
        event.creationTimezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      series: false,
      // Create proposers if provided
      proposers:
        event.proposers && event.proposers.length > 0
          ? {
              create: event.proposers.map((p: { userId: string }) => ({
                userId: p.userId,
              })),
            }
          : undefined,
    };

    // Create the event in the database
    const createdEvent = await prisma.event.create({
      data: eventData,
      include: {
        proposers: true,
      },
    });

    // Return the created event
    return NextResponse.json(createdEvent);
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
