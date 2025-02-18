import { RSVP_TYPE } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { sendEventEmail } from "src/utils/email/send";

export async function POST(request: Request) {
  const { eventHash } = await request.json();

  try {
    // @note we have to do findFirst here because previous version of Convo
    // expected series events to be multiple events with the same hash
    // in the current version, eventhash is unique (but not marked as such in the schema)
    // so findFirst can be safely expected to always return an array of single event
    const event = await prisma.event.findFirst({
      where: {
        hash: eventHash,
        isDeleted: false,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Then update it using its ID
    const updated = await prisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        isDeleted: true,
        sequence: event.sequence + 1,
      },
      include: {
        proposer: true,
        rsvps: {
          include: {
            attendee: true,
          },
        },
      },
    });

    console.log(`Sending email to the proposer`);
    // send email to the proposer
    await sendEventEmail({
      receiver: updated.proposer,
      type: "deleted-proposer",
      event: updated,
    });

    console.log(`Sending email to the rsvps`);
    // send event deleted emails to all attendees marked as "going" or "maybe"
    await Promise.all(
      updated.rsvps
        .filter(
          (rsvp) =>
            rsvp.rsvpType === RSVP_TYPE.GOING ||
            rsvp.rsvpType === RSVP_TYPE.MAYBE
        )
        .map((rsvp) =>
          sendEventEmail({
            receiver: rsvp.attendee,
            type: "deleted-attendee",
            event: updated,
          })
        )
    );
    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    console.error("Error marking event as deleted:", error);
    return NextResponse.json(
      { error: "Failed to mark event as deleted" },
      { status: 500 }
    );
  }
}
