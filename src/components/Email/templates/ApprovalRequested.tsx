import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "RSVP Approval Request: {{event.title}}";

export const ApprovalRequestedEmailTemplate: React.FC<
  Readonly<
    EmailTemplateWithEventProps & {
      approvalRequest?: {
        user: { nickname: string; email?: string };
        message?: string;
        rsvpType: string;
      };
    }
  >
> = ({ firstName, event, approvalRequest }) => (
  <EmailWrapper>
    <div>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          margin: "0 0 24px 0",
          color: "#111",
        }}
      >
        New RSVP Request for Your Event
      </h1>

      <p style={{ margin: "0 0 24px 0", color: "#4a4a4a" }}>
        Hello {firstName}! Someone has requested to RSVP to your event that
        requires approval.
      </p>

      {approvalRequest && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "24px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 12px 0",
              color: "#111",
            }}
          >
            Request Details
          </h3>

          <p style={{ margin: "0 0 8px 0", color: "#4a4a4a" }}>
            <strong>From:</strong> {approvalRequest.user.nickname}
            {approvalRequest.user.email && ` (${approvalRequest.user.email})`}
          </p>

          <p style={{ margin: "0 0 8px 0", color: "#4a4a4a" }}>
            <strong>RSVP Type:</strong> {approvalRequest.rsvpType}
          </p>

          {approvalRequest.message && (
            <div style={{ marginTop: "12px" }}>
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "#4a4a4a",
                  fontWeight: "600",
                }}
              >
                Message:
              </p>
              <p
                style={{
                  margin: "0",
                  color: "#6b7280",
                  fontStyle: "italic",
                  padding: "8px 12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                }}
              >
                &quot;{approvalRequest.message}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f4",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "#111",
          }}
        >
          {event.title}
        </h2>

        <EventDetails event={event} />
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        <a
          href={`${
            process.env.NEXT_PUBLIC_SITE_URL || "https://convo.cafe"
          }/rsvp/${event.hash}`}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "600",
            margin: "0 8px",
          }}
        >
          Review & Approve
        </a>
      </div>

      <p style={{ margin: "24px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
        Visit your event page to approve or reject this request. You can also
        add a message when making your decision.
      </p>
    </div>
  </EmailWrapper>
);
