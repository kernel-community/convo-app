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
import { ConvoEvent } from "src/components/Email/types";
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
  // @todo @note @dev
  // modifying proposer to be hedwig, only for calendar invites
  // the only problem is that when the recipient marks themselves as No, the recipient might receive a bounced email (since hedwig@convo.cafe does not exist)
  // ideally we'd like the recipients to not mark anything via their calendar
  // so in a way that bounced email might actually be a good reminder for them to go to the app and update their RSVP
  const modifiedTempEvent = {
    ...event,
    proposer: hedwig as User,
  };
  const iCal = await generateiCalString([
    await generateiCalRequestFromEvent({
      event: modifiedTempEvent,
      recipientEmail: receiver.email,
      recipientName: receiver.nickname,
      rsvpType: emailTypeToRsvpType(type),
    }),
  ]);
  console.log({ iCal });
  // Process subject template variables
  const processSubject = (subject: string, data: { event: ConvoEvent }) => {
    return subject.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split(".");
      let value: any = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value?.toString() ?? match;
    });
  };

  // Convert Prisma Event to ConvoEvent format
  const convoEvent: ConvoEvent = {
    id: event.id,
    title: event.title,
    descriptionHtml: event.descriptionHtml ?? undefined,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime.toISOString(),
    location: event.location,
    locationType: event.locationType,
    hash: event.hash,
    limit: event.limit,
    sequence: event.sequence,
    isDeleted: event.isDeleted,
    gCalEventId: event.gCalEventId ?? undefined,
    type: event.type,
    proposerId: event.proposerId,
    proposerName: event.proposer.nickname,
  };

  // Create basic template props without event for non-event templates
  const basicProps = { firstName: receiver.nickname };

  // Create full props with event for templates that need it
  const fullProps = { ...basicProps, event: convoEvent };

  // Get template and subject
  const { template, subject: rawSubject } = getEmailTemplateFromType(
    type,
    fullProps
  );

  const subject = processSubject(rawSubject, { event: convoEvent });
  const method =
    emailTypeToRsvpType(type) === "NOT_GOING" || event.isDeleted === true
      ? "CANCEL"
      : "REQUEST";
  const opts: CreateEmailOptions = {
    from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
    to: [receiver.email],
    subject,
    react: template,
    text: text || "Email from Convo Cafe",
    attachments: [
      {
        filename: "convo.ics",
        contentType: `text/calendar;charset=utf-8;method=${method}`,
        content: iCal.toString(),
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
