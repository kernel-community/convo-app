import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateTitle } from "src/utils/generateTitle";
import { generateDescription } from "src/utils/generateDescription";
import { parseDateTime } from "src/utils/parseDateTime";
import { parseLocation } from "src/utils/parseLocation";

export async function POST(req: NextRequest) {
  try {
    const { text, now, tzOffset } = await req.json();

    // Process data based on text length
    if (text.length > 30) {
      // For longer text, generate title and description
      const [titleResult, descriptionResult, dateTimeResult, locationResult] =
        await Promise.all([
          generateTitle(text),
          generateDescription(text),
          parseDateTime(text, now, tzOffset),
          parseLocation(text),
        ]);

      return NextResponse.json({
        title: titleResult.title,
        description: descriptionResult.description,
        dateTime: dateTimeResult,
        location: locationResult,
      });
    } else {
      // For shorter text, use text as title and description
      const [dateTimeResult, locationResult] = await Promise.all([
        parseDateTime(text, now, tzOffset),
        parseLocation(text),
      ]);

      return NextResponse.json({
        title: text,
        description: text,
        dateTime: dateTimeResult,
        location: locationResult,
      });
    }
  } catch (error) {
    console.error("Error processing data:", error);
    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 }
    );
  }
}
