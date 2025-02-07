import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";
import * as chrono from "chrono-node";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

function parseDateTimeFromText(text: string) {
  const parsed = chrono.casual.parse(text, new Date(), { forwardDate: true });
  if (parsed.length === 0 || !parsed[0]) return null;

  const startComponents = parsed[0].start;
  const endComponents = parsed[0].end;

  let startDate = startComponents.date();
  let endDate = endComponents?.date();

  // If start date is in the past, adjust to the next occurrence
  const now = new Date();
  if (startDate < now) {
    // If time was specified but date wasn't, move to next day
    if (
      startComponents.isCertain("hour") &&
      !startComponents.isCertain("day")
    ) {
      startDate = new Date(startDate.setDate(now.getDate() + 1));
    } else {
      // Move to next occurrence of the same time
      while (startDate < now) {
        startDate = new Date(startDate.setDate(startDate.getDate() + 1));
      }
    }
  }

  // If no end time specified, set end time to 1 hour after start
  if (!endDate && startDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  } else if (endDate && endDate < startDate) {
    // If end date is before start date, adjust it to be after start date
    const duration =
      endDate.getTime() - new Date(endComponents?.date() || "").getTime();
    endDate = new Date(startDate.getTime() + duration);
  }

  return startDate && endDate
    ? {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      }
    : null;
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({
        title: "Untitled Convo",
        dateTime: null,
      });
    }

    // Parse date and time first
    const dateTime = parseDateTimeFromText(description);

    const response = await cohere.chat({
      message: `Create a concise title (max 150 characters) that summarizes this description: ${description}

This is how I want you to go about it:
1. First, try to understand what is being said in the text.
2. If you cannot understand, simply return the first 50 characters of the text.
3. If you can understand, summarize it to a concise title, capturing the main idea.
4. Next, try to understand the tone, and if it is informal include one or two emojis if appropriate.
5. Output only the title, no explanations, nothing other than the title.
6. If the language is not English, Skip. Don't try to summarize, just return the first 50 characters.

Remember to output only the title, no explanations, nothing other than the title.

Your response:`,
      model: "command",
      temperature: 0.3,
      maxTokens: 20,
    });

    // Clean and format the title
    const title = response.text
      .trim()
      .replace(/["']/g, "") // Remove quotes
      .replace(/^Title: /i, "") // Remove 'Title:' prefix if present
      .replace(/^Event: /i, ""); // Remove 'Event:' prefix if present

    return NextResponse.json({
      title: title || "Untitled Convo",
      dateTime,
    });
  } catch (error) {
    console.error("Error generating title:", error);
    // Return a 500 error but still provide a fallback title
    return NextResponse.json(
      {
        title: "Untitled Convo",
        dateTime: null,
        error: "Failed to generate title",
      },
      { status: 500 }
    );
  }
}
