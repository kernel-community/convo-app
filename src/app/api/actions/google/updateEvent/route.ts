import { pick } from "lodash";
import { updateEvents } from "src/utils/google/updateEvents";
import { DEFAULT_HOST } from "src/utils/constants";
import type { FullEvent } from "../createEvent/route";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = headers();
  const host = headersList.get("host") ?? "kernel";
  const body = await req.json();
  const {
    events,
  }: { events: { updated: Array<FullEvent>; deleted: Array<FullEvent> } } =
    pick(body, ["events"]);

  if (!events) {
    throw new Error("`event` not found in req.body");
  }

  const ids = await updateEvents({
    events,
    reqHost: host || DEFAULT_HOST,
  });

  return NextResponse.json({
    data: ids,
  });
}
