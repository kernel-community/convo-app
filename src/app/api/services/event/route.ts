/**
 * Serves an event ics file
 */
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const community = searchParams.get("community");
  const eventId = searchParams.get("eventId");

  console.log({ community, eventId });

  // todo

  return new Response();
}
