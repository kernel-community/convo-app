import { z } from "zod";

// Basic schema for now, might need adjustment based on actual form fields.
export const rsvpInputSchema = z.object({
  nickname: z.string().min(1, { message: "Nickname is required" }),
  // Add other expected form fields here if necessary
});

// Infer the type from the schema
export type RsvpInput = z.infer<typeof rsvpInputSchema>;
