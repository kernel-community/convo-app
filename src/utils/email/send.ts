// send email
import type { User } from "@prisma/client";
import type { CreateEmailOptions } from "resend";
import type { EmailType } from "src/components/Email";
import { getEmailTemplateFromType } from "src/components/Email";
import { resend } from "src/utils/email/resend";
import { generateiCalString } from "../ical/generateiCalString";
import type { EventWithProposerAndRsvps } from "../ical/generateiCalRequestFromEventId";
import { generateiCalRequestFromEvent } from "../ical/generateiCalRequestFromEventId";
import { EVENT_ORGANIZER_EMAIL } from "../constants";
import { EVENT_ORGANIZER_NAME } from "../constants";
import { emailTypeToRsvpType } from "../emailTypeToRsvpType";
export const sendEventEmail = async ({
  receiver,
  event,
  type,
  text,
}: {
  receiver: User;
  type: EmailType;
  text?: string;
  event: EventWithProposerAndRsvps;
}) => {
  if (!receiver.email) {
    throw new Error(`receiver ${receiver.id} has no email`);
  }

  const hedwig: Partial<EventWithProposerAndRsvps["proposer"]> = {
    email: EVENT_ORGANIZER_EMAIL,
    nickname: EVENT_ORGANIZER_NAME,
  };

  const iCal = await generateiCalString([
    await generateiCalRequestFromEvent({
      event:
        type === "create" || type === "update"
          ? { ...event, proposer: hedwig as User }
          : type === "invite-not-going" || type === "invite-maybe"
          ? { ...event, sequence: event.sequence + 1 }
          : event,
      recipientEmail: receiver.email,
      recipientName: receiver.nickname,
      rsvpType: emailTypeToRsvpType(type),
    }),
  ]);
  console.log({ iCal });
  const { template, subject } = getEmailTemplateFromType(type, {
    firstName: receiver.nickname,
  });

  const opts: CreateEmailOptions = {
    from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
    to: [receiver.email],
    subject,
    react: template,
    text: text || "Email from Convo Cafe",
    attachments: [
      {
        filename: "convo.ics",
        contentType: "text/calendar;charset=utf-8;method=REQUEST",
        content: iCal.toString(), // @todo remove .toString()
      },
    ],
  };
  console.log({ opts });
  try {
    const { data, error } = await resend.emails.send(opts);

    if (error) {
      // Log the specific error details
      console.error("Email sending failed:", {
        error,
        recipient: opts.to,
        subject: opts.subject,
      });

      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from resend");
    }

    return data;
  } catch (e) {
    // Handle any unexpected errors from the API
    console.error("Unexpected error while sending email:", e);
    throw new Error(
      e instanceof Error
        ? e.message
        : "An unexpected error occurred while sending email"
    );
  }
};
