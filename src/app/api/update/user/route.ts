import type { User } from "@prisma/client";
import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user }: { user: Partial<User> } = _.pick(body, ["user"]);

  const fetchWithUserId = user.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
      })
    : undefined;

  const fetchWithEmail = await prisma.user.findUnique({
    where: { email: user.email ?? "" },
  });

  const fetched = fetchWithUserId || fetchWithEmail;

  let updated;
  if (!fetched) {
    // create
    updated = await prisma.user.create({
      data: { ...user },
    });
  } else {
    // update
    updated = await prisma.user.update({
      where: { id: fetched.id },
      data: { ...user },
    });
  }

  console.log(`
    Updated user ${JSON.stringify(updated)} for id: ${updated.id}
  `);

  return NextResponse.json({ data: updated });
}
