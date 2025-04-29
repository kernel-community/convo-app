import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";

export async function GET() {
  try {
    // Try to get a count from events table
    const eventCount = await prisma.event.count();

    // Try to get the latest event
    const latestEvent = await prisma.event.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      diagnostics: {
        eventCount,
        latestEvent,
        databaseUrl: process.env.DATABASE_DATABASE_URL?.replace(
          /:[^:@]+@/,
          ":****@"
        ), // Hide password
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error,
        diagnostics: {
          databaseUrl: process.env.DATABASE_DATABASE_URL?.replace(
            /:[^:@]+@/,
            ":****@"
          ), // Hide password
          nodeEnv: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 500,
      }
    );
  }
}
