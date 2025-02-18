import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Can&apos;t make it to {{event.title}}";

export const InviteNotGoingEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1
        style={{
          marginBottom: "24px",
          fontSize: "24px",
          fontWeight: "bold",
          margin: "0",
        }}
      >
        Thanks for letting us know!
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, we&apos;ve noted that you won&apos;t be able to
          attend:
        </p>

        <div
          style={{
            padding: "24px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 12px 0",
            }}
          >
            {event.title}
          </h2>
          <EventDetails event={event} showDescription={false} />
        </div>

        <div
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#6b7280",
            }}
          >
            No worries at all! We hope to catch you at another Convo soon. Feel
            free to update your RSVP if your plans change.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
