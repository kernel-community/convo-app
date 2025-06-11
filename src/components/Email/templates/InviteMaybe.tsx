import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { TongueStickingOutEmoji } from "../components/EmailEmojis";

export const SUBJECT = "Tentative RSVP: {{event.title}}";

export const InviteMaybeEmailTemplate: React.FC<
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
        We&apos;ll keep your spot warm{" "}
        <TongueStickingOutEmoji width={30} height={30} />
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, you&apos;ve marked yourself as maybe attending:
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
            What this means:
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
              The host knows you&apos;re interested but not fully committed
            </li>
            <li style={{ margin: "4px 0" }}>
              You&apos;ll still get reminders in case you can make it
            </li>
            <li style={{ margin: "4px 0" }}>
              You can change your RSVP anytime before the Convo starts
            </li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
