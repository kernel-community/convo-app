import type { ConvoEvent } from "../types";
import { DateTime } from "luxon";

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

// Helper function to format proposer names
const formatProposers = (proposers: ConvoEvent["proposers"]): string => {
  if (!proposers || proposers.length === 0) {
    return "Host"; // Fallback if no proposers
  }
  if (proposers.length === 1) {
    return proposers[0]?.nickname ?? "Host";
  } else if (proposers.length === 2) {
    return `${proposers[0]?.nickname ?? "Host"} and ${
      proposers[1]?.nickname ?? "Host"
    }`;
  } else {
    const remaining = proposers.length - 2;
    return `${proposers[0]?.nickname ?? "Host"}, ${
      proposers[1]?.nickname ?? "Host"
    } and ${remaining} other${remaining > 1 ? "s" : ""}`;
  }
};

// Helper function to format date with timezone info for email
const formatDateWithTimezone = (
  dateTime: string,
  timezone?: string
): string => {
  try {
    if (timezone) {
      // Use the original timezone when available
      const dt = DateTime.fromISO(dateTime).setZone(timezone);

      // Format with the timezone name
      const formattedDate = dt.toFormat("EEEE, MMMM d, yyyy");
      const formattedTime = dt.toFormat("h:mm a");
      const zoneName = dt.toFormat("ZZZZ"); // Full timezone name

      return `${formattedDate} at ${formattedTime} ${zoneName}`;
    } else {
      // Fallback to UTC if no timezone is available
      const dt = DateTime.fromISO(dateTime).toUTC();

      const formattedDate = dt.toFormat("EEEE, MMMM d, yyyy");
      const formattedTime = dt.toFormat("h:mm a");

      return `${formattedDate} at ${formattedTime} UTC`;
    }
  } catch (e) {
    // Fallback to default formatting if something goes wrong
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleString();
  }
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
      <strong>When:</strong>{" "}
      {formatDateWithTimezone(event.startDateTime, event.creationTimezone)}
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

    {showHost && event.proposers && event.proposers.length > 0 && (
      <div>
        <strong>Host:</strong> {formatProposers(event.proposers)}
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
