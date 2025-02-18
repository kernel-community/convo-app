import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("bounced");
  console.log(body);
  return NextResponse.json(null);
}
