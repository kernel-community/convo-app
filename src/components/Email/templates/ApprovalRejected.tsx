import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "RSVP Request Update: {{event.title}}";

export const ApprovalRejectedEmailTemplate: React.FC<
  Readonly<
    EmailTemplateWithEventProps & {
      approvalRequest?: {
        reviewer?: { nickname: string };
        reviewMessage?: string;
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
        RSVP Request Update
      </h1>

      <p style={{ margin: "0 0 24px 0", color: "#4a4a4a" }}>
        Hello {firstName}, we wanted to update you on your RSVP request for the
        following event.
      </p>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#fef2f2",
          borderRadius: "8px",
          marginBottom: "24px",
          borderLeft: "4px solid #ef4444",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#991b1b",
          }}
        >
          Request Not Approved
        </h3>

        <p style={{ margin: "0 0 8px 0", color: "#7f1d1d" }}>
          Unfortunately, your RSVP request was not approved at this time.
        </p>

        {approvalRequest && (
          <>
            {approvalRequest.reviewer && (
              <p style={{ margin: "8px 0", color: "#7f1d1d" }}>
                <strong>Reviewed by:</strong>{" "}
                {approvalRequest.reviewer.nickname}
              </p>
            )}

            {approvalRequest.reviewMessage && (
              <div style={{ marginTop: "12px" }}>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "#7f1d1d",
                    fontWeight: "600",
                  }}
                >
                  Message from organizer:
                </p>
                <p
                  style={{
                    margin: "0",
                    color: "#991b1b",
                    fontStyle: "italic",
                    padding: "8px 12px",
                    backgroundColor: "#fee2e2",
                    borderRadius: "4px",
                  }}
                >
                  &quot;{approvalRequest.reviewMessage}&quot;
                </p>
              </div>
            )}
          </>
        )}
      </div>

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
          padding: "20px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          marginBottom: "24px",
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
          What&apos;s Next?
        </h3>

        <ul style={{ margin: "0", paddingLeft: "20px", color: "#4a4a4a" }}>
          <li style={{ marginBottom: "8px" }}>
            You can try submitting another request if circumstances change
          </li>
          <li style={{ marginBottom: "8px" }}>
            Consider reaching out to the organizer directly if you have
            questions
          </li>
          <li>Look for other similar events that might interest you</li>
        </ul>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        <a
          href={`${
            process.env.NEXT_PUBLIC_SITE_URL || "https://convo.events"
          }/rsvp/${event.hash}`}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#6b7280",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "600",
          }}
        >
          View Event Details
        </a>
      </div>

      <p style={{ margin: "24px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
        Thank you for your interest in this event. We hope you&apos;ll find
        other events that are a great fit.
      </p>
    </div>
  </EmailWrapper>
);
