import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { PartyPopperEmoji } from "../components/EmailEmojis"; // Assuming a suitable emoji component exists

export const SUBJECT = "You're off the waitlist for {{event.title}}!";

export const OffWaitlistEmailTemplate: React.FC<
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
          Good news! You&apos;re in! <PartyPopperEmoji width={30} height={30} />
        </h1>

        <div style={{ marginTop: "16px" }}>
          <p style={{ margin: "0 0 16px 0" }}>
            Hi {firstName}, a spot opened up and you&apos;re now confirmed as
            &quot;going&quot; for:
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

          <p style={{ margin: "0 0 16px 0" }}>
            We&apos;ve automatically updated your RSVP status to
            &quot;Going&quot;.
          </p>

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
              backgroundColor: "#3b82f6", // Example blue color
              borderRadius: "6px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            View Convo Details
          </a>

          <div
            style={{
              marginTop: "24px",
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
                We&apos;ve added this event to your calendar (check for an
                invite update).
              </li>
              <li style={{ margin: "4px 0" }}>
                You&apos;ll get a reminder 1 hour before the Convo starts.
              </li>
              <li style={{ margin: "4px 0" }}>
                No need to do anything else - just show up!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </EmailWrapper>
  );
};
