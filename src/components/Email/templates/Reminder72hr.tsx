import React from "react";
import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";

export const SUBJECT = "72-Hour Reminder: Upcoming Convo with {proposerName}";

export const Reminder72hrEmailTemplate: React.FC<
  EmailTemplateWithEventProps
> = ({ event, firstName, attendees = [] }) => {
  // Create the event URL
  const eventUrl = `${process.env.NEXT_PUBLIC_URL || "https://convo.cafe"}/e/${
    event.hash
  }`;

  // Format date and time
  const eventDate = new Date(event.startDateTime);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Get only going and maybe attendees
  const relevantAttendees =
    attendees?.filter(
      (a) => a.rsvpStatus === "GOING" || a.rsvpStatus === "MAYBE"
    ) || [];

  // Limit to 10 attendees if there are more
  const displayAttendees = relevantAttendees.slice(0, 10);
  const hasMoreAttendees = relevantAttendees.length > 10;

  return (
    <EmailWrapper>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "600",
          margin: "0 0 24px 0",
          color: "#111827",
        }}
      >
        Your Convo is in 3 days
      </h1>

      <div style={{ marginTop: "16px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          Hi {firstName}, your upcoming Convo is in 3 days:
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
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Date:</strong> {formattedDate}
          </p>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Time:</strong> {formattedTime}
          </p>
          {event.location && (
            <p style={{ margin: "0 0 4px 0" }}>
              <strong>Location:</strong> {event.location}
            </p>
          )}
        </div>

        {displayAttendees.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "0 0 12px 0",
              }}
            >
              You&apos;ll be attending with:
            </h3>
            <p style={{ margin: "0", color: "#4b5563" }}>
              {displayAttendees.map((a) => a.nickname).join(", ")}
              {hasMoreAttendees && "... and others"}
            </p>
          </div>
        )}

        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <a
            href={eventUrl}
            style={{
              display: "inline-block",
              color: "#6366F1", // Indigo-500 color from the app
              fontSize: "18px",
              fontWeight: "600",
              textDecoration: "none",
              borderBottom: "1px dotted #6366F1",
              padding: "4px 0",
              margin: "0 auto",
            }}
          >
            View Convo Details
          </a>
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: "#F3F4F6", // Gray-100
            borderRadius: "8px",
            borderLeft: "4px solid #6366F1", // Indigo-500
          }}
        >
          <h3
            style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}
          >
            Share this Convo
          </h3>
          <p style={{ margin: "0 0 8px 0" }}>
            Know someone who might be interested? Share this link with them:
          </p>
          <div
            style={{
              padding: "8px",
              backgroundColor: "white",
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          >
            <a
              href={eventUrl}
              style={{
                wordBreak: "break-all",
                color: "#6366F1",
                fontWeight: "500",
              }}
            >
              {eventUrl}
            </a>
          </div>
        </div>

        <p style={{ margin: "0 0 16px 0" }}>
          Need to change your RSVP? You can update it anytime on the Convo page.
        </p>
      </div>
    </EmailWrapper>
  );
};
