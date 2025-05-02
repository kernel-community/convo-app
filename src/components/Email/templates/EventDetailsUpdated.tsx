import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { StarryEyesEmoji } from "../components/EmailEmojis";

export const SUBJECT = "Important: Details updated for {{event.title}}";

export const EventDetailsUpdatedEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "24px",
          fontWeight: "bold",
          margin: "0",
        }}
      >
        Event Details Updated
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "24px",
          margin: "16px 0",
        }}
      >
        Hi {firstName},
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "24px",
          margin: "16px 0",
        }}
      >
        <strong>Important:</strong> The details for a convo you&apos;re
        attending have been updated:
      </p>

      <EventDetails event={event} />

      <p
        style={{
          fontSize: "16px",
          lineHeight: "24px",
          margin: "16px 0",
        }}
      >
        Please review the updated details. A calendar invite with the new
        information has been attached to this email.
      </p>

      <p
        style={{
          fontSize: "16px",
          lineHeight: "24px",
          margin: "16px 0",
        }}
      >
        You can update your response anytime before the convo starts.
      </p>
    </div>
  </EmailWrapper>
);
