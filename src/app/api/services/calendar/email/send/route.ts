import { getEmailTemplateFromType } from "src/components/Email/Test";
import { Resend } from "resend";
import { DateTime } from "luxon";
import type { ICalRequestParams } from "src/utils/generateICalString";
import { generateICalRequest } from "src/utils/generateICalString";
import { pick } from "lodash";
import type { NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import {
  EVENT_ORGANIZER_EMAIL,
  EVENT_ORGANIZER_NAME,
} from "src/utils/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    eventIds,
    recipientName,
    recipientEmail,
    type,
  }: {
    eventIds: Array<string>;
    recipientName: string;
    recipientEmail: string;
    type: "create" | "invite" | "update";
  } = pick(body, ["eventIds", "recipientName", "recipientEmail", "type"]);
  const events = await prisma.event.findMany({
    where: {
      id: {
        in: eventIds,
      },
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
  console.log(`sending email for ${JSON.stringify(events)}`);
  if (events.length < 1) {
    const error = `No events found for the given event ids`;
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
        name: event.proposer.nickname,
        email: EVENT_ORGANIZER_EMAIL,
      },
      uid: event.id,
      title: event.title,
      description: event.descriptionHtml || "",
      location: event.location,
      sequence: event.sequence,
      recipient: { email: recipientEmail },
      rrule: event.rrule,
      allOtherrecipients: event.rsvps.map((rsvp) => ({
        name: rsvp.attendee.nickname,
        email: rsvp.attendee.email || "",
      })),
    };
  });
  const iCal = generateICalRequest(iCalRequests);
  console.log(iCal);

  const { template, subject } = getEmailTemplateFromType(type, {
    firstName: recipientName,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${EVENT_ORGANIZER_NAME}<${EVENT_ORGANIZER_EMAIL}>`,
      to: [recipientEmail],
      subject,
      react: template,
      text: "Email from Convo Cafe",
      attachments: [
        {
          filename: "convo.ics",
          content_type: "text/calendar;charset=utf-8;method=REQUEST",
          content: iCal.toString(),
        },
      ],
    });
    if (error) {
      console.log("there was an error");
      console.log(error);
      return Response.json({ error }, { status: 500 });
    }
    console.log(`email sent ${JSON.stringify(data)}`);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
