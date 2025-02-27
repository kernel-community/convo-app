import { betaMode, experimentalUI, newCursorRooms } from "src/lib/flags";
import { NextResponse } from "next/server";

export async function GET() {
  // Test all flags
  const [isBeta, isExperimental, hasCursorRooms] = await Promise.all([
    betaMode(),
    experimentalUI(),
    newCursorRooms(),
  ]);

  return NextResponse.json({
    flags: {
      betaMode: isBeta,
      experimentalUI: isExperimental,
      newCursorRooms: hasCursorRooms,
    },
    timestamp: new Date().toISOString(),
  });
}
