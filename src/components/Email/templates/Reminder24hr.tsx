import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Reminder: Your Convo is tomorrow";

export const Reminder24hrEmailTemplate: React.FC<
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
        Your Convo is tomorrow!
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, here&apos;s a reminder about your upcoming Convo:
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
            You&apos;ll get another reminder 1 hour before the Convo starts.
            Feel free to update your RSVP if your plans have changed.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
