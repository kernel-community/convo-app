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
  <div className="mt-3 flex flex-col gap-2 text-sm">
    <p>
      <strong>When:</strong> {new Date(event.startDateTime).toLocaleString()}
    </p>
    <p>
      <strong>Where:</strong> {event.location}
    </p>
    {showDescription && event.descriptionHtml && (
      <p>
        <strong>Description:</strong> {event.descriptionHtml}
      </p>
    )}
    {showHost && (
      <p>
        <strong>Host:</strong> {event.proposerName}
      </p>
    )}
    <p>
      <strong>Location:</strong>{" "}
      {event.locationType === "ONLINE" ? (
        <a href={event.location} className="text-primary hover:underline">
          Join meeting
        </a>
      ) : (
        event.location
      )}
    </p>
  </div>
);
