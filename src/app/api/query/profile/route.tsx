import type { NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { NextResponse } from "next/server";
import _ from "lodash";
import type { Profile } from "@prisma/client";
import { DEFAULT_PROFILE_IMAGE } from "src/utils/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId } = _.pick(body, ["userId"]);
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  return NextResponse.json({
    data: {
      ...profile,
      photo: profile?.photo || DEFAULT_PROFILE_IMAGE,
    } as Profile,
  });
}
