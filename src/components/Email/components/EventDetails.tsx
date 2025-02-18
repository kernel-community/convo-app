import { ConvoEvent } from "../types";

interface EventDetailsProps {
  event: ConvoEvent;
  showDescription?: boolean;
  showHost?: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  showDescription = true,
  showHost = true,
}) => (
  <div
    style={{
      marginTop: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "14px",
    }}
  >
    <p style={{ margin: "0" }}>
      <strong>When:</strong> {new Date(event.startDateTime).toLocaleString()}
    </p>
    <p style={{ margin: "0" }}>
      <strong>Where:</strong> {event.location}
    </p>
    {showDescription && event.descriptionHtml && (
      <p style={{ margin: "0" }}>
        <strong>Description:</strong> {event.descriptionHtml}
      </p>
    )}
    {showHost && (
      <p style={{ margin: "0" }}>
        <strong>Host:</strong> {event.proposerName}
      </p>
    )}
    <p style={{ margin: "0" }}>
      <strong>Location:</strong>{" "}
      {event.locationType === "ONLINE" ? (
        <a
          href={event.location}
          style={{
            color: "#2563eb",
            textDecoration: "none",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Join meeting
        </a>
      ) : (
        event.location
      )}
    </p>
  </div>
);
