import { EmailTemplate } from "src/components/Email/Test";
import { Resend } from "resend";
import { DateTime } from "luxon";
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
    eventId,
    recipientName,
    recipientEmail,
  }: {
    eventId: string;
    recipientName: string;
    recipientEmail: string;
  } = pick(body, ["eventId", "recipientName", "recipientEmail"]);

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

  const sdt = DateTime.fromISO(event.startDateTime.toISOString(), {
    zone: "utc",
  });
  const edt = DateTime.fromISO(event.endDateTime.toISOString(), {
    zone: "utc",
  });

  const startTime = `${sdt.toFormat("yyyyLLdd")}T${sdt.toFormat("HHmmss")}Z`;
  const endTime = `${edt.toFormat("yyyyLLdd")}T${edt.toFormat("HHmmss")}Z`;

  const iCal = generateICalRequest({
    start: startTime,
    end: endTime,
    organizer: {
      name: EVENT_ORGANIZER_NAME,
      email: EVENT_ORGANIZER_EMAIL,
    },
    uid: eventId,
    title: event.title,
    description: event.descriptionHtml || "",
    location: event.location,
    sequence: event.sequence,
    recipient: { email: recipientEmail },
    rrule: event.rrule,
  });
  try {
    const { data, error } = await resend.emails.send({
      from: `${EVENT_ORGANIZER_NAME}<${EVENT_ORGANIZER_EMAIL}>`,
      to: [recipientEmail],
      subject: "You're invited 🦄",
      react: EmailTemplate({ firstName: recipientName }),
      text: "You're invited",
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
