import { EmailTemplateWithEventProps } from "../types";
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
          marginBottom: "24px",
          fontSize: "24px",
          fontWeight: "bold",
          margin: "0",
        }}
      >
        Hello {firstName}! Your Convo is ready 🎉
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          You&apos;ve successfully created a new Convo. Here are the details:
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
              style={{ color: "#6b7280", margin: "0 0 12px 0" }}
              dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
            />
          )}
          <EventDetails event={event} />
        </div>

        <p style={{ margin: "16px 0 0 0" }}>
          We&apos;ll notify you when people RSVP. You can always check the
          status and make updates by visiting your Convo dashboard.
        </p>
      </div>
    </div>
  </EmailWrapper>
);
