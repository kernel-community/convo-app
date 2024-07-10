import { pick } from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { sendInvite } from "src/utils/google/sendInvite";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { events, email }: { events: Array<string>; email: string } = pick(
    body,
    ["events", "email"]
  );

  if (!events || !email) {
    throw new Error("`events` and/or `email` not found in req.body");
  }

  await sendInvite({
    events,
    attendeeEmail: email,
  });

  return NextResponse.json({
    data: true,
  });
}
