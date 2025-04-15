import type { User } from "@prisma/client";
import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user }: { user: Partial<User> } = _.pick(body, ["user"]);

  // Extract referer header to check where the request came from
  const referer = req.headers.get("referer") || "";
  const isFromProfilePage = referer.includes("/profile");

  console.log(
    `Update user request from: ${referer}, isFromProfilePage: ${isFromProfilePage}`
  );

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
    // New user - create with all provided data
    updated = await prisma.user.create({
      data: { ...user },
    });
  } else {
    // Existing user - preserve nickname if it exists and this is not from profile page
    const updateData = { ...user };

    // Only preserve existing nickname if:
    // 1. The request is not from the profile page (e.g., it's from Dynamic login)
    // 2. The user already has a custom nickname
    // 3. We're trying to update the nickname
    if (
      !isFromProfilePage &&
      fetched.nickname &&
      fetched.nickname !== DEFAULT_USER_NICKNAME &&
      updateData.nickname
    ) {
      console.log(
        `Request not from profile page, preserving existing nickname "${fetched.nickname}" for user ${fetched.id}`
      );
      delete updateData.nickname;
    } else if (updateData.nickname) {
      console.log(
        `Updating nickname to "${updateData.nickname}" for user ${fetched.id}`
      );
    }

    // Update with modified data
    updated = await prisma.user.update({
      where: { id: fetched.id },
      data: updateData,
    });
  }

  console.log(`
    Updated user ${JSON.stringify(updated)} for id: ${updated.id}
  `);

  return NextResponse.json({ data: updated });
}
