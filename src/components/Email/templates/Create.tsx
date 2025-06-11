import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "New Convo: {{event.title}}";

export const CreateEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
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
        Hello {firstName}! Your Convo is ready 🎉
      </h1>

      <p style={{ margin: "0 0 24px 0", color: "#4a4a4a" }}>
        You&apos;ve successfully created a new Convo. Here are the details:
      </p>

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

      <p style={{ margin: "0", color: "#4a4a4a" }}>
        We&apos;ll notify you when people RSVP. You can always check the status
        and make updates by visiting your Convo dashboard.
      </p>
    </div>
  </EmailWrapper>
);
