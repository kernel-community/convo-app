import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";

export async function GET() {
  // Fetch your most important/active events from your database
  // For example: events from today onwards, or most viewed events
  const events = await prisma.event.findMany({
    where: {
      startDateTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDateTime: "asc",
    },
    take: 100, // Limit to a reasonable number
    select: {
      hash: true,
    },
  });

  return NextResponse.json(events);
}
