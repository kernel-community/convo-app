import type { Profile } from "@prisma/client";
import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { profile }: { profile: Profile } = _.pick(body, ["profile"]);

  const updated = await prisma.profile.upsert({
    where: { userId: profile.userId },
    create: { ...profile },
    update: { ...profile },
    include: { user: true },
  });

  console.log(`
    Updated user profile for user: ${updated.user.nickname}\n\n${JSON.stringify(
    updated
  )}
  `);

  return NextResponse.json({ data: updated });
}
