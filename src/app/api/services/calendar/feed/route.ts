/**
 * Serves a calendar feed for a given community
 */
import { DateTime } from "luxon";
import type { NextRequest } from "next/server";
import { EVENT_ORGANIZER_EMAIL } from "src/utils/constants";
import { prisma } from "src/utils/db";
import type { ICalRequestParams } from "src/utils/ical/generateiCalString";
import { generateiCalString } from "src/utils/ical/generateiCalString";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const subdomain = searchParams.get("communityDomain");
  if (!subdomain) {
    throw new Error("community not defined");
  }
  const community = await prisma.community.findUniqueOrThrow({
    where: { subdomain },
    include: {
      events: {
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
  const events = community.events;
  if (events.length < 1) {
    const error = `No events found for the given community`;
    return Response.json({ error }, { status: 500 });
  }

  const iCalRequests: Array<ICalRequestParams> = events.map((event) => {
    const sdt = DateTime.fromISO(event.startDateTime.toISOString(), {
      zone: "utc",
    });
    const edt = DateTime.fromISO(event.endDateTime.toISOString(), {
      zone: "utc",
    });
    return {
      start: `${sdt.toFormat("yyyyLLdd")}T${sdt.toFormat("HHmmss")}Z`,
      end: `${edt.toFormat("yyyyLLdd")}T${edt.toFormat("HHmmss")}Z`,
      organizer: {
        name: event.proposers[0]?.user?.nickname ?? "Convo Proposer",
        email: EVENT_ORGANIZER_EMAIL,
      },
      status: event.isDeleted ? "CANCELLED" : "CONFIRMED",
      uid: event.id,
      title: event.title,
      description: event.descriptionHtml || "",
      location: event.location,
      sequence: event.sequence,
      recipient: { email: "", rsvpType: "" },
      rrule: event.rrule,
      allOtherrecipients: event.rsvps.map((rsvp) => ({
        name: rsvp.attendee.nickname,
        email: rsvp.attendee.email || "",
      })),
    };
  });
  const iCal = generateiCalString(iCalRequests);

  const calendar = iCal.toString();

  return new Response(calendar.toString(), {
    status: 200,
    headers: { "Content-Type": "text/calendar" },
  });
}
