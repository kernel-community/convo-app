import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.log("inside foo");
  return NextResponse.json({ ok: true });
}
