import { NextResponse } from "next/server";
import { sendEventEmail, sendBatch } from "src/utils/email/send";
import type { User } from "@prisma/client";
import type { CreateEmailOptions } from "resend";

export async function POST(request: Request) {
  // Enable streaming
  try {
    const { recipients, event, message } = await request.json();

    const total = recipients.length;

    // Prepare all email options for batch sending
    const emailBatch: CreateEmailOptions[] = [];
    const processedRecipients: { attendee: User; index: number }[] = [];

    // Convert event dates to Date objects
    const processedEvent = {
      ...event,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    };

    // Create email options for each recipient
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      try {
        // Prepare email options but don't send yet
        const emailOptions = (await sendEventEmail({
          receiver: recipient.attendee,
          event: processedEvent,
          type: "proposer-message",
          text: message,
          returnOptionsOnly: true, // New parameter to just return options without sending
        })) as CreateEmailOptions;

        // Remove attachments as they're not supported by Resend's batch API
        const { attachments, ...emailOptionsWithoutAttachments } = emailOptions;

        emailBatch.push(emailOptionsWithoutAttachments);
        processedRecipients.push({ attendee: recipient.attendee, index: i });
      } catch (error) {
        console.error(
          `Error preparing email for ${recipient.attendee.email}:`,
          error
        );
      }
    }

    // Send all emails in batch
    if (emailBatch.length > 0) {
      try {
        console.log("sending batch");
        const results = await sendBatch(emailBatch);
        console.log("finished sending batch");
        // Report success for each recipient
        for (let i = 0; i < processedRecipients.length; i++) {
          const recipient = processedRecipients[i];
          if (!recipient) continue;

          const { attendee } = recipient;
        }
      } catch (error) {
        console.error(`Error in batch sending:`, error);
        throw error;
      }
    }

    // Return a successful response
    return NextResponse.json(
      {
        success: true,
        message: `Successfully sent ${emailBatch.length} messages`,
        count: emailBatch.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending messages:", error);
    return NextResponse.json(
      { error: "Failed to send messages" },
      { status: 500 }
    );
  }
}
