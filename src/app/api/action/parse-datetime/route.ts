import OpenAI from "openai";
import { NextResponse } from "next/server";
import { formatWithTimezone } from "src/utils/formatWithTimezone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = (
  now: string
) => `You are a JSON API that extracts date and time information from text. Current time with timezone is: ${now}.

You must respond with a valid JSON object containing 'start' and 'end' timestamps.

Rules for Date/Time Interpretation:
1. Handle relative time expressions:
   - "tomorrow", "next week", "in 2 days"
   - "morning" = 9:00 AM in the input timezone
   - "afternoon" = 2:00 PM in the input timezone
   - "evening" = 6:00 PM in the input timezone
   - "night" = 8:00 PM in the input timezone
   - "breakfast" = 9:00 AM in the input timezone
   - "lunch" = 12:00 PM in the input timezone
   - "dinner" = 7:00 PM in the input timezone
   - "midnight" = 12:00 AM in the input timezone
   - "noon" = 12:00 PM in the input timezone

2. Combine relative dates with times:
   - "tomorrow evening" = next day at 6:00 PM in the input timezone
   - "next week breakfast" = same day next week at 9:00 AM in the input timezone
   - "friday night" = upcoming Friday at 8:00 PM in the input timezone

3. Time Resolution Rules:
   - Use the timezone from the input 'now' time for all calculations
   - If no specific date mentioned but time is, assume the next occurrence
   - If the resulting time would be in the past relative to input time, move it to the next occurrence
   - If no end time specified, set it to 1 hour after start time
   - If end time is specified but would be before start time, adjust it to be after start time
   - For vague time references, use standard times listed above
   - If a time range is implied (e.g., "evening"), use 2-hour duration

4. Return Format:
   - Return null if no valid date/time found
   - Return in strict ISO format with the SAME timezone offset as the input time
   - Both start and end times must use the input timezone

Example (if input time is 2024-02-12T19:44:15-08:00):
{"text": "tomorrow morning", "output": {"start": "2024-02-13T09:00:00-08:00", "end": "2024-02-13T10:00:00-08:00"}}
{"text": "next week for dinner", "output": {"start": "2024-02-19T19:00:00-08:00", "end": "2024-02-19T20:00:00-08:00"}}
{"text": "friday evening", "output": {"start": "2024-02-15T18:00:00-08:00", "end": "2024-02-15T20:00:00-08:00"}}
{"text": "in 2 days for breakfast", "output": {"start": "2024-02-14T09:00:00-08:00", "end": "2024-02-14T10:00:00-08:00"}}

IMPORTANT: Always preserve the timezone offset from the input time in the output times. Do not convert to UTC or any other timezone.

You must respond with a valid JSON object. Example response format:
{"start": "2024-02-13T09:00:00-08:00", "end": "2024-02-13T10:00:00-08:00"}
`;

export async function POST(request: Request) {
  try {
    const { text, now, tzOffset } = await request.json();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt(now),
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ start: null, end: null });
    }

    const parsed = JSON.parse(content);
    if (!parsed.start || !parsed.end) {
      return NextResponse.json({ start: null, end: null });
    }

    // Parse the dates and format them with the local timezone
    const startDate = new Date(parsed.start);
    const endDate = new Date(parsed.end);

    const start = formatWithTimezone(startDate, tzOffset);
    const end = formatWithTimezone(endDate, tzOffset);

    console.log({ start, end, now, tzOffset });

    return NextResponse.json({
      start,
      end,
    });
  } catch (error) {
    console.error("Error parsing datetime:", error);
    return NextResponse.json(
      { error: "Failed to parse datetime" },
      { status: 500 }
    );
  }
}
