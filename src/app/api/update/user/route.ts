import type { User } from "@prisma/client";
import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/utils/db";
import { auth } from "@clerk/nextjs/server";
import { DEFAULT_USER_NICKNAME } from "src/utils/constants";

export async function POST(req: NextRequest) {
  // Check authentication
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { user }: { user: Partial<User> } = _.pick(body, ["user"]);

  // Ensure user can only update their own data
  if (user.id && user.id !== clerkUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use the authenticated user ID
  const userToUpdate = { ...user, id: clerkUserId };

  // Extract referer header to check where the request came from
  const referer = req.headers.get("referer") || "";
  const isFromProfilePage = referer.includes("/profile");

  console.log(
    `Update user request from: ${referer}, isFromProfilePage: ${isFromProfilePage}`
  );

  try {
    // First, try to find user by Clerk ID
    const fetchedUser = await prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    let updated;

    if (fetchedUser) {
      // User exists with Clerk ID - just update
      updated = await prisma.user.update({
        where: { id: clerkUserId },
        data: {
          ...userToUpdate,
          nickname:
            userToUpdate.nickname ||
            fetchedUser.nickname ||
            DEFAULT_USER_NICKNAME,
        },
      });
      console.log("Updated existing user with Clerk ID:", updated);
    } else {
      // User doesn't exist with Clerk ID - check if they exist by email (migration scenario)
      const email = userToUpdate.email;
      if (email) {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email: email },
        });

        if (existingUserByEmail) {
          // User exists with same email but different ID (migration from Dynamic)
          console.log(
            `Found existing user by email, updating ID from ${existingUserByEmail.id} to ${clerkUserId}`
          );

          // Update the existing user's ID to the new Clerk ID
          // Remove id from userToUpdate to avoid conflict
          const { id, ...userUpdateData } = userToUpdate;
          updated = await prisma.user.update({
            where: { id: existingUserByEmail.id },
            data: {
              id: clerkUserId,
              ...userUpdateData,
              nickname:
                userToUpdate.nickname ||
                existingUserByEmail.nickname ||
                DEFAULT_USER_NICKNAME,
            },
          });
          console.log("Migrated user from Dynamic ID to Clerk ID:", updated);
        } else {
          // No user exists with this email - create new user
          updated = await prisma.user.create({
            data: {
              ...userToUpdate,
              id: clerkUserId,
              nickname: userToUpdate.nickname || DEFAULT_USER_NICKNAME,
            },
          });
          console.log("Created new user:", updated);
        }
      } else {
        // No email provided - create new user anyway
        updated = await prisma.user.create({
          data: {
            ...userToUpdate,
            id: clerkUserId,
            nickname: userToUpdate.nickname || DEFAULT_USER_NICKNAME,
          },
        });
        console.log("Created new user without email:", updated);
      }
    }

    console.log("User operation completed successfully:", updated);
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
