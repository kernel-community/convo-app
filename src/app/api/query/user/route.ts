import _ from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/server/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId } = _.pick(body, ["userId"]);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return NextResponse.json({
    data: user,
  });
}
