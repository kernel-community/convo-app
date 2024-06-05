import { NextResponse } from "next/server";

export async function POST() {
  console.log("inside foo");
  return NextResponse.json({ ok: true });
}
