import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";

export async function POST(request: Request) {
  try {
    const { nickname, email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Upsert the user
    const user = await prisma.user.upsert({
      where: { email },
      update: {}, // Don't update anything for existing users
      create: {
        email,
        nickname: nickname || email.split("@")[0], // Use part before @ as default nickname
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
