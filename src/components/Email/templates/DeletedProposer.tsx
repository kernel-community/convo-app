import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "{{event.title}} has been cancelled";

export const DeletedProposerEmailTemplate: React.FC<
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
        Convo Cancelled
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, you&apos;ve cancelled:
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
            All attendees have been notified. You can always create a new Convo
            if you&apos;d like to reschedule.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
