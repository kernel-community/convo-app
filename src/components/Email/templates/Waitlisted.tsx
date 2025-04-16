import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { HourglassIconEmoji } from "../components/EmailEmojis";

export const SUBJECT = "You're on the waitlist for {{event.title}}";

export const WaitlistedEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => {
  const eventUrl = `${
    process.env.NEXT_PUBLIC_URL || "https://convo.cafe"
  }/rsvp/${event.hash}`;

  return (
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
          You&apos;re on the waitlist!{" "}
          <HourglassIconEmoji width={30} height={30} />
        </h1>

        <div style={{ marginTop: "16px" }}>
          <p style={{ margin: "0 0 16px 0" }}>
            Hi {firstName}, the Convo you tried to RSVP for is currently full.
            We&apos;ve added you to the waitlist for:
          </p>

          <div
            style={{
              padding: "24px",
              backgroundColor: "#f3f4f6", // Light gray background
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
            <EventDetails event={event} />
          </div>

          <p style={{ margin: "0 0 16px 0" }}>
            If a spot opens up, we&apos;ll automatically move you to
            &quot;Going&quot; and send you another email notification.
          </p>

          {/* Using styled <a> tag instead of Button component */}
          <a
            href={eventUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#ffffff",
              backgroundColor: "#6b7280", // Gray color for waitlist
              borderRadius: "6px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            View Convo Details
          </a>

          <p style={{ marginTop: "24px", fontSize: "14px", color: "#6b7280" }}>
            You can update your RSVP to &quot;Maybe&quot; or &quot;Not
            Going&quot; at any time by visiting the Convo page. This will remove
            you from the waitlist.
          </p>
        </div>
      </div>
    </EmailWrapper>
  );
};
