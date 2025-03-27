import OpenAI from "openai";
import { NextResponse } from "next/server";
import { formatWithTimezone } from "src/utils/formatWithTimezone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = (
  now: string
) => `You are a JSON API that extracts date and time information from text. Current time with timezone is: ${now}.

You must respond with a valid JSON object containing 'start' and 'end' timestamps in 24-hour format.

Rules for Time Interpretation (STRICT - NO EXCEPTIONS):
1. EXACT Time Mappings (use 24-hour format):
   - "6pm", "6PM", "6:00pm", "6:00PM" = EXACTLY 18:00
   - "morning" = EXACTLY 09:00
   - "afternoon" = EXACTLY 14:00
   - "evening" = EXACTLY 18:00
   - "night" = EXACTLY 20:00
   - "breakfast" = EXACTLY 09:00
   - "lunch" = EXACTLY 12:00
   - "dinner" = EXACTLY 19:00
   - "midnight" = EXACTLY 00:00
   - "noon" = EXACTLY 12:00

2. Time Input Rules:
   - For specific times (e.g. "6pm"), use EXACTLY that time (18:00)
   - For time words (e.g. "evening"), use the EXACT mapping above
   - NEVER approximate or adjust these times
   - ALL times must be in 24-hour format

3. Date Handling:
   - For "tomorrow" - use next calendar day
   - For "next week" - use same day next week
   - For "in X days" - add X calendar days

4. Output Rules:
   - ALWAYS preserve the input timezone offset
   - If no end time given, add EXACTLY 1 hour to start time
   - Format: YYYY-MM-DDTHH:mm:ss[TIMEZONE]
   - Example: 2024-02-14T18:00:00-08:00

5. Examples (with input time 2024-02-14T08:00:00-08:00):
   Input: "tomorrow 6pm"
   Output: {
     "start": "2024-02-15T18:00:00-08:00",
     "end": "2024-02-15T19:00:00-08:00"
   }

   Input: "next week evening"
   Output: {
     "start": "2024-02-21T18:00:00-08:00",
     "end": "2024-02-21T19:00:00-08:00"
   }

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

    // Instead of parsing and reformatting, just validate the format
    const isValidDateFormat = (dateStr: string) => {
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(
        dateStr
      );
    };

    if (!isValidDateFormat(parsed.start) || !isValidDateFormat(parsed.end)) {
      console.error("Invalid date format from OpenAI");
      return NextResponse.json({ start: null, end: null });
    }

    // Use the dates directly from OpenAI's response
    const { start, end } = parsed;
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
