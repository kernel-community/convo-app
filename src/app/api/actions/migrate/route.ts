// store data from data.ts to the database
import { NextResponse } from "next/server";
import { migrate } from "src/utils/migrate/migrate";
export async function POST() {
  let created;
  try {
    created = await migrate();
  } catch (err) {
    throw err;
  }
  return NextResponse.json({
    data: created,
  });
}
