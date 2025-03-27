import React from "react";
import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";

export const SUBJECT = "72-Hour Reminder: Your Convo is Coming Up";

export const Reminder72hrProposerEmailTemplate: React.FC<
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

  // Separate attendees by RSVP status
  const goingAttendees =
    attendees?.filter((a) => a.rsvpStatus === "GOING") || [];
  const maybeAttendees =
    attendees?.filter((a) => a.rsvpStatus === "MAYBE") || [];
  const notGoingAttendees =
    attendees?.filter((a) => a.rsvpStatus === "NOT_GOING") || [];

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
          Hi {firstName}, your Convo is coming up in 3 days:
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

        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 12px 0",
            }}
          >
            Attendee Status:
          </h3>

          {goingAttendees.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "500" }}>
                Going ({goingAttendees.length}):
              </p>
              <p style={{ margin: "0", color: "#4b5563" }}>
                {goingAttendees.map((a) => a.nickname).join(", ")}
              </p>
            </div>
          )}

          {maybeAttendees.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "500" }}>
                Maybe ({maybeAttendees.length}):
              </p>
              <p style={{ margin: "0", color: "#4b5563" }}>
                {maybeAttendees.map((a) => a.nickname).join(", ")}
              </p>
            </div>
          )}

          {notGoingAttendees.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "500" }}>
                Not Going ({notGoingAttendees.length}):
              </p>
              <p style={{ margin: "0", color: "#4b5563" }}>
                {notGoingAttendees.map((a) => a.nickname).join(", ")}
              </p>
            </div>
          )}
        </div>

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
            Share & Manage Your Convo
          </h3>
          <p style={{ margin: "0 0 8px 0" }}>As the host, you can:</p>
          <ul style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>
              <a
                href={eventUrl}
                style={{ color: "#6366F1", fontWeight: "500" }}
              >
                Send a message to all attendees
              </a>
            </li>
            <li style={{ marginBottom: "8px" }}>
              Share this link with people you&apos;d like to invite:
            </li>
          </ul>
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
      </div>
    </EmailWrapper>
  );
};
