import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Your Convo has been updated";

export const UpdateProposerEmailTemplate: React.FC<
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
        Convo Details Updated
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, your Convo has been updated with new details:
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
            What to do next:
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
              Visit your dashboard to see the updated details
            </li>
            <li style={{ margin: "4px 0" }}>
              Check if the new time and location work for you
            </li>
            <li style={{ margin: "4px 0" }}>Update your RSVP if needed</li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
