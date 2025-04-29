import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";

export const SUBJECT = "{{event.title}} has been cancelled";

export const DeletedAttendeeEmailTemplate: React.FC<
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
          Hi {firstName}, a Convo you were planning to attend has been
          cancelled:
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
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0" }}>
              <strong>When:</strong>{" "}
              {new Date(event.startDateTime).toLocaleString()}
            </p>
            <p style={{ margin: "0" }}>
              <strong>Where:</strong> {event.location}
            </p>
            <p style={{ margin: "0" }}>
              <strong>Host:</strong>{" "}
              {event.proposers && event.proposers.length > 0
                ? event.proposers.length === 1
                  ? `${event.proposers[0]?.nickname ?? "Convo Cafe"}`
                  : `${event.proposers[0]?.nickname ?? "Convo Cafe"} and ${
                      event.proposers.length - 1
                    } other${event.proposers.length - 1 > 1 ? "s" : ""}`
                : "Convo Cafe" // Fallback if proposers array is empty/missing
              }
            </p>
          </div>
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
            The host has cancelled this Convo. The calendar event will be
            automatically removed from your calendar.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
