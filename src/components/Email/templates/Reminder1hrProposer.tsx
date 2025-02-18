import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Reminder: Your Convo starts in 1 hour (Host)";

export const Reminder1hrProposerEmailTemplate: React.FC<
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
        Your Convo starts in 1 hour!
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, this is a reminder for the Convo you&apos;re hosting:
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
          {event.descriptionHtml && (
            <div
              style={{
                color: "#6b7280",
                margin: "0 0 12px 0",
              }}
              dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
            />
          )}
          <EventDetails event={event} />
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
            Check your calendar or visit the Convo dashboard to see the latest
            RSVPs and any updates.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
