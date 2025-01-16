// send email
import type { User } from "@prisma/client";
import type { CreateEmailOptions } from "resend";
import type { EmailType } from "src/components/Email/Test";
import { getEmailTemplateFromType } from "src/components/Email/Test";
import { resend } from "src/utils/email/resend";
import { generateiCalString } from "../ical/generateiCalString";
import type { EventWithProposerAndRsvps } from "../ical/generateiCalRequestFromEventId";
import { generateiCalRequestFromEvent } from "../ical/generateiCalRequestFromEventId";
import { prisma } from "src/utils/db";
import { emailTypeToReminderEnum } from "../emailTypeConversions";
export const sendEventInviteEmail = async ({
  sender,
  receiver,
  event,
  type,
  text,
  scheduledAt,
}: {
  sender: User;
  receiver: User;
  type: EmailType;
  text?: string;
  event: EventWithProposerAndRsvps;
  scheduledAt?: Date;
}) => {
  if (!sender.email) {
    throw new Error(`sender ${sender.id} has no email`);
  }
  if (!receiver.email) {
    throw new Error(`receiver ${receiver.id} has no email`);
  }

  const iCal = await generateiCalString([
    await generateiCalRequestFromEvent({
      event,
      recipientEmail: receiver.email,
    }),
  ]);

  const { template, subject } = getEmailTemplateFromType(type, {
    firstName: receiver.nickname,
  });

  const opts: CreateEmailOptions = {
    from: `${sender.nickname} <${sender.email}>`,
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
    scheduledAt: scheduledAt?.toISOString(),
  };
  console.log(
    `generated opts to send email to ${receiver.email} for event ${
      event.id
    } at ${scheduledAt?.toISOString()}`
  );
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

    if (scheduledAt) {
      await prisma.email.create({
        data: {
          eventId: event.id,
          userId: receiver.id,
          type: emailTypeToReminderEnum(type),
          sent: true,
          reminderId: data.id,
        },
      });
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
