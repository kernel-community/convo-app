import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Message from the host of Convo: {{event.title}}";

interface ProposerMessageTemplateProps extends EmailTemplateWithEventProps {
  message: string;
}

export const ProposerMessageTemplate: React.FC<
  Readonly<ProposerMessageTemplateProps>
> = ({ firstName, event, message }) => (
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
        New message from the host
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, you received a message about:
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
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              borderRadius: "6px",
              marginBottom: "16px",
              whiteSpace: "pre-wrap",
            }}
          >
            {message}
          </div>
          <EventDetails
            event={event}
            showDescription={false}
            showLocation={false}
          />
        </div>
      </div>
    </div>
  </EmailWrapper>
);
