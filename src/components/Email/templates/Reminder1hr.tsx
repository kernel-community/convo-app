import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Reminder: Your Convo is in 1 hour";

export const Reminder1hrEmailTemplate: React.FC<
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
          Hi {firstName}, this is a reminder for your upcoming Convo:
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
      </div>
    </div>
  </EmailWrapper>
);
