import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "{{event.title}} has been updated";

export const UpdateAttendeeMaybeEmailTemplate: React.FC<
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
        A Convo you&apos;re interested in has been updated
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, {event.proposerName} has updated the details for a
          Convo you&apos;re marked as maybe attending:
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
              Review the new details to see if they work better for you
            </li>
            <li style={{ margin: "4px 0" }}>
              Your RSVP is still set to &quot;maybe&quot;
            </li>
            <li style={{ margin: "4px 0" }}>
              You can update your response anytime before the Convo starts
            </li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
