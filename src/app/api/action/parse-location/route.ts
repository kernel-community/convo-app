import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You will be provided with a text and your task is to figure out the location. Extract both explicit and implicit location references.

Rules:
1. Return a clean, formatted location string
2. Handle both physical and virtual locations (e.g., Zoom, Google Meet)
3. If it's a virtual meeting with a link, include the link
4. For indirect/generic locations, return them as is but make them descriptive
5. If no location is found or implied, return null
6. Return in strict JSON format

Examples of valid locations:
- Explicit addresses: "123 Main St, San Francisco, CA"
- Virtual meetings: "Zoom: https://zoom.us/j/123456789"
- Generic places: "Local coffee shop", "Neighborhood park"
- Personal spaces: "My rooftop", "Host's backyard"
- Relative locations: "Around the corner from Central Park"
- Business types: "Any nearby cafe", "The Italian restaurant downtown"

Example outputs:
{"location": "123 Main St, San Francisco, CA"}
{"location": "Zoom: https://zoom.us/j/123456789"}
{"location": "Host's rooftop terrace"}
{"location": "Local coffee shop downtown"}
{"location": null}

Note: For indirect locations, try to be as descriptive as possible while maintaining the original context. Always return a JSON string.`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
      return NextResponse.json({ location: null });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({ location: parsed.location });
  } catch (error) {
    console.error("Error parsing location:", error);
    return NextResponse.json(
      { error: "Failed to parse location" },
      { status: 500 }
    );
  }
}
