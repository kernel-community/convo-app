import _, { isNil } from "lodash";
import { prisma } from "src/utils/db";
import type { EventType } from "@prisma/client";
import { nanoid } from "nanoid";
import isProd from "src/utils/isProd";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { ClientEventInput } from "src/types";
import { sendEventInviteEmail } from "src/utils/email/send";

export type Session = {
  dateTime: Date;
  duration: number;
  count: number;
};
export type ClientEvent = {
  description?: string | undefined;
  title: string;
  sessions: Session[];
  limit: string;
  location: string;
  nickname?: string;
  gCalEvent: boolean;
  email?: string;
  type?: EventType;
  hash?: string;
  recurrenceRule?: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    event,
    userId,
  }: {
    event: ClientEventInput;
    userId: string;
  } = _.pick(body, ["event", "userId", "hash"]);
  const headersList = headers();
  const host = headersList.get("host") ?? "kernel";

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const hash = event.hash || nanoid(10);

  const subdomain = host?.split(".")[0];

  let community = await prisma.community.findUnique({
    where: { subdomain: subdomain },
  });

  if (!community) {
    // @note
    // fallback on kernel community if subdomain not found
    community = await prisma.community.findUnique({
      where: { subdomain: isProd(host) ? "kernel" : "staging" },
    });
  }

  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }

  const created = await prisma.event.create({
    data: {
      title: event.title,
      descriptionHtml: event.description,
      startDateTime: new Date(event.dateTimeStartAndEnd.start),
      endDateTime: new Date(event.dateTimeStartAndEnd.end),
      location: event.location,
      hash, // to be deprecated
      series: !!event.recurrenceRule,
      rrule: event.recurrenceRule,
      proposerId: user.id,
      limit: Number(event.limit),
      communityId: community?.id,
    },
    include: {
      proposer: true,
      community: {
        include: {
          slack: true,
          google: true,
        },
      },
      rsvps: {
        include: {
          attendee: true,
        },
      },
    },
  });
  console.log(
    `Created event for ${JSON.stringify(event)} for user: ${user.id}`
  );

  // send email to the proposer
  await sendEventInviteEmail({
    receiver: created.proposer,
    type: "create",
    event: created,
    text: "Email from Convo Cafe",
  });

  // set reminder for an hour before the event starts
  await sendEventInviteEmail({
    receiver: created.proposer,
    type: "reminder1hrProposer",
    event: created,
    scheduledAt: new Date(created.startDateTime.getTime() - 1 * 60 * 60 * 1000),
  });

  // send notification on a slack channel
  try {
    await fetch(
      `${
        host?.includes("localhost") ? "http" : "https"
      }://${host}/api/services/slack/notify`,
      {
        body: JSON.stringify({ eventId: created.id, type: "new" }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (err) {
    console.log(`Error in sending slack notification`);
    console.error(err);
  }

  // return res.status(200).json({ data: created });
  return NextResponse.json({ data: created });
}
