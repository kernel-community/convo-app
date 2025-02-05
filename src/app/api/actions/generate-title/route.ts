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
      message: `Create a title for this conversation that matches its tone and style: ${description}

Rules:
1. Maximum 40 characters
2. Match the tone and style of the input description
3. If the description is casual, make it fun and playful
4. If the description is serious, keep it professional but approachable
5. If the description mentions activities, include relevant emojis
6. NO explanations or extra text
7. ONLY output the title

Format examples for casual conversations:
Coffee & Chill: Design Chat ☕
Board Game Night & Pizza 🎲
Cozy Book Club: Fantasy Reads 📚

Format examples for professional conversations:
Tech Strategy Discussion 💡
Product Review: Q1 Roadmap 📊
Team Sync: Project Updates ✨

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
