import { ConvoEvent } from "../types";

interface EventDetailsProps {
  event: ConvoEvent;
  showDescription?: boolean;
  showHost?: boolean;
  showLocation?: boolean;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  showDescription = true,
  showHost = true,
  showLocation = true,
}) => (
  <div
    style={{
      marginTop: "12px",
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "12px",
      fontSize: "14px",
      color: "#4a4a4a",
    }}
  >
    <div>
      <strong>When:</strong> {new Date(event.startDateTime).toLocaleString()}
    </div>

    {showDescription && event.descriptionHtml && (
      <div>
        <strong>Description:</strong>{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: truncateText(event.descriptionHtml, 250),
          }}
        />
      </div>
    )}

    {showHost && (
      <div>
        <strong>Host:</strong> {event.proposerName}
      </div>
    )}
    {showLocation && (
      <div>
        <strong>Location:</strong>{" "}
        <span
          style={{
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          {event.location}
        </span>
      </div>
    )}
    <div>
      <strong>View Event:</strong>{" "}
      <span
        style={{
          color: "#2563eb",
          textDecoration: "none",
        }}
      >
        {`https://convo.cafe/rsvp/${event.hash}`}
      </span>
    </div>
  </div>
);
