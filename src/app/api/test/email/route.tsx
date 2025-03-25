import { NextResponse } from "next/server";
import { getEmailTemplateFromType, type EmailType } from "src/components/Email";
import type { ConvoEvent } from "src/components/Email/types";
import { renderAsync } from "@react-email/render";
import type React from "react";

export async function GET(request: Request) {
  // Get the email type from the query params
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "reminder1hr";

  // Create a sample event for testing
  const sampleEvent: ConvoEvent = {
    id: "test-id",
    title: "Test Convo: Coffee Chat",
    descriptionHtml:
      "<p>Let's catch up and discuss the latest developments!</p>",
    startDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    endDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    location: "Zoom Meeting",
    locationType: "ONLINE",
    hash: "test-hash",
    limit: 10,
    sequence: 0,
    isDeleted: false,
    type: "JUNTO",
    proposerId: "test-proposer-id",
    proposerName: "Test Proposer",
  };

  // Create the event URL
  const eventUrl = `${process.env.NEXT_PUBLIC_URL || "https://convo.cafe"}/e/${
    sampleEvent.hash
  }`;

  try {
    // Get the email template
    const { template, subject } = getEmailTemplateFromType(type as EmailType, {
      firstName: "Test User",
      event: sampleEvent,
    });

    // Render the email template to HTML
    // Cast template to ReactElement to satisfy the renderAsync type requirements
    const html = await renderAsync(template as React.ReactElement);

    // Create a simple wrapper to display the email
    const previewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Preview: ${subject}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .controls {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 8px;
            }
            .email-container {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-header {
              padding-bottom: 15px;
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .email-info {
              margin-bottom: 10px;
              color: #555;
            }
            .email-info span {
              font-weight: bold;
              color: #333;
            }
            .email-body {
              padding: 10px;
            }
            .reminder-note {
              margin-top: 20px;
              padding: 10px;
              background-color: #fffde7;
              border-left: 4px solid #ffd600;
              font-size: 14px;
            }
            select {
              padding: 8px;
              border-radius: 4px;
              border: 1px solid #ddd;
              margin-right: 10px;
            }
            button {
              padding: 8px 16px;
              background-color: #0070f3;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background-color: #0060df;
            }
          </style>
          <script>
            function changeEmailType() {
              const type = document.getElementById('emailType').value;
              window.location.href = \`?type=\${type}\`;
            }
          </script>
        </head>
        <body>
          <div class="controls">
            <h2>Email Template Preview</h2>
            <div>
              <select id="emailType">
                <option value="reminder1hr" ${
                  type === "reminder1hr" ? "selected" : ""
                }>1 Hour Reminder</option>
                <option value="reminder24hr" ${
                  type === "reminder24hr" ? "selected" : ""
                }>24 Hour Reminder</option>
                <option value="reminder1min" ${
                  type === "reminder1min" ? "selected" : ""
                }>1 Minute Reminder</option>
                <option value="reminder1hrProposer" ${
                  type === "reminder1hrProposer" ? "selected" : ""
                }>1 Hour Reminder (Proposer)</option>
                <option value="create" ${
                  type === "create" ? "selected" : ""
                }>Create Event</option>
                <option value="invite-going" ${
                  type === "invite-going" ? "selected" : ""
                }>Invite (Going)</option>
                <option value="invite-maybe" ${
                  type === "invite-maybe" ? "selected" : ""
                }>Invite (Maybe)</option>
              </select>
              <button onclick="changeEmailType()">Change Template</button>
            </div>
          </div>

          <div class="email-container">
            <div class="email-header">
              <div class="email-info"><span>Subject:</span> ${subject}</div>
              <div class="email-info"><span>From:</span> Convo Cafe &lt;hedwig@convo.cafe&gt;</div>
              <div class="email-info"><span>To:</span> Test User &lt;user@example.com&gt;</div>
            </div>

            <div class="email-body">
              ${html}
            </div>

            <div class="reminder-note">
              <p><strong>Note:</strong> The scheduled reminder emails will not include attachments. Instead, they will include a link to the convo:</p>
              <p><a href="${eventUrl}">${eventUrl}</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(previewHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error rendering email template:", error);
    return NextResponse.json(
      { error: "Failed to render email template" },
      { status: 500 }
    );
  }
}
