import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";

export async function GET() {
  try {
    // Try a simple query first
    const testQuery = await prisma.$queryRaw`SELECT 1 as connected`;

    // If that works, try to get a count from a real table
    const eventCount = await prisma.event.count();

    return NextResponse.json({
      success: true,
      connection: testQuery,
      diagnostics: {
        eventCount,
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"), // Hide password
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error,
        diagnostics: {
          databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"), // Hide password
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
