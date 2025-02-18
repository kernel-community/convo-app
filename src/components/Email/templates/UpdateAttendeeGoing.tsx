import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { StarryEyesEmoji } from "../components/EmailEmojis";

export const SUBJECT = "RSVP Updated: You&apos;re going to {{event.title}}";

export const UpdateAttendeeGoingEmailTemplate: React.FC<
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
        You&apos;re now going! <StarryEyesEmoji width={30} height={30} />
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, we&apos;ve updated your RSVP to &quot;going&quot; for:
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
              margin: "0 0 8px 0",
              fontWeight: "500",
            }}
          >
            What happens now:
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
              We&apos;ve updated your calendar invite
            </li>
            <li style={{ margin: "4px 0" }}>
              You&apos;ll get a reminder 1 hour before
            </li>
            <li style={{ margin: "4px 0" }}>
              The host has been notified of your update
            </li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
