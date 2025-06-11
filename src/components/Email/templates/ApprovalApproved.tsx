import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Your RSVP was approved: {{event.title}}";

export const ApprovalApprovedEmailTemplate: React.FC<
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
        🎉 Your RSVP Request Was Approved!
      </h1>

      <p style={{ margin: "0 0 24px 0", color: "#4a4a4a" }}>
        Great news, {firstName}! Your request to RSVP has been approved by the
        event organizer.
      </p>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#ecfdf5",
          borderRadius: "8px",
          marginBottom: "24px",
          borderLeft: "4px solid #10b981",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#065f46",
          }}
        >
          ✓ Request Approved
        </h3>

        {approvalRequest && (
          <>
            <p style={{ margin: "0 0 8px 0", color: "#047857" }}>
              <strong>Your RSVP Status:</strong> {approvalRequest.rsvpType}
            </p>

            {approvalRequest.reviewer && (
              <p style={{ margin: "0 0 8px 0", color: "#047857" }}>
                <strong>Approved by:</strong>{" "}
                {approvalRequest.reviewer.nickname}
              </p>
            )}

            {approvalRequest.reviewMessage && (
              <div style={{ marginTop: "12px" }}>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "#047857",
                    fontWeight: "600",
                  }}
                >
                  Message from organizer:
                </p>
                <p
                  style={{
                    margin: "0",
                    color: "#065f46",
                    fontStyle: "italic",
                    padding: "8px 12px",
                    backgroundColor: "#d1fae5",
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
            backgroundColor: "#10b981",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "600",
          }}
        >
          View Event Details
        </a>
      </div>

      <div
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontWeight: "500",
          }}
        >
          Quick tips:
        </p>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#6b7280",
            listStyleType: "disc",
          }}
        >
          <li style={{ margin: "4px 0" }}>
            Add this to your calendar using the attached .ics file
          </li>
          <li style={{ margin: "4px 0" }}>
            You&apos;ll get a reminder 1 hour before the event
          </li>
          <li style={{ margin: "4px 0" }}>
            Need to change your RSVP? No worries, just visit the event page
          </li>
        </ul>
      </div>

      <p style={{ margin: "24px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
        You&apos;re all set! We&apos;ll send you reminders as the event
        approaches. You can always update your RSVP or view event details by
        visiting the event page.
      </p>
    </div>
  </EmailWrapper>
);
