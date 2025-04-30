import type { ServerEvent } from "src/types";
import type { User } from "@prisma/client";

export type EmailTemplateType =
  | "create"
  | "invite"
  | "update"
  | "update-proposer"
  | "update-attendee-going"
  | "update-attendee-maybe"
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder72hr"
  | "reminder72hrproposer";

export type EmailTemplateParams = {
  event: ServerEvent;
  receiver?: User;
};

// Type definition for a template function
export type EmailTemplateFunction = (params: EmailTemplateParams) => string;

// Type definition for community-specific template sets
export type CommunityEmailTemplates = {
  [templateName in EmailTemplateType]?: EmailTemplateFunction;
};

// Template registry by community subdomain
const emailTemplates: Record<string, Partial<CommunityEmailTemplates>> = {
  // Kernel community templates
  kernel: {
    create: ({ event, receiver }) => `
      <h1>New Event: ${event.title}</h1>
      <p>Hello ${receiver?.nickname || "Kernel member"},</p>
      <p>A new event has been created by the Kernel community.</p>
      <p><strong>Title:</strong> ${event.title}</p>
      <p><strong>When:</strong> ${new Date(
        event.startDateTime
      ).toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.location}</p>
      <p>Visit <a href="https://kernel.convo.cafe">kernel.convo.cafe</a> to RSVP!</p>
    `,
    // More templates specific to kernel...
  },

  // Test/local templates
  localhost: {
    create: ({ event, receiver }) => `
      <h1>TEST: New Event Created</h1>
      <p>Hello ${receiver?.nickname || "test user"},</p>
      <p>This is a test notification for a new event: ${event.title}</p>
      <p>This event was created in the test environment.</p>
    `,
    // More templates specific to test environment...
  },

  // Default templates (fallback)
  default: {
    create: ({ event, receiver }) => `
      <h1>New Event: ${event.title}</h1>
      <p>Hello ${receiver?.nickname || "there"},</p>
      <p>A new event has been created.</p>
      <p><strong>Title:</strong> ${event.title}</p>
      <p><strong>When:</strong> ${new Date(
        event.startDateTime
      ).toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.location}</p>
      <p>Click the link below to view the event details and RSVP.</p>
    `,
    update: ({ event, receiver }) => `
      <h1>Event Updated: ${event.title}</h1>
      <p>Hello ${receiver?.nickname || "there"},</p>
      <p>An event you're following has been updated.</p>
      <p><strong>Title:</strong> ${event.title}</p>
      <p><strong>When:</strong> ${new Date(
        event.startDateTime
      ).toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.location}</p>
    `,
    // Add default templates for all other email types
  },
};

/**
 * Gets the email template for a specific community and template type
 * Falls back to default templates if a community-specific one isn't found
 */
export function getEmailTemplate(
  communitySubdomain: string,
  templateType: EmailTemplateType
): EmailTemplateFunction {
  // Try to get community-specific template
  const communityTemplates = emailTemplates[communitySubdomain] || {};
  const specificTemplate = communityTemplates[templateType];

  if (specificTemplate) {
    return specificTemplate;
  }

  // Fall back to default template
  const defaultTemplate = emailTemplates.default?.[templateType];

  if (!defaultTemplate) {
    throw new Error(`No template found for type: ${templateType}`);
  }

  return defaultTemplate;
}

/**
 * Generate HTML email content using templates based on community
 */
export function generateEmailContent(
  communitySubdomain: string,
  templateType: EmailTemplateType,
  params: EmailTemplateParams
): string {
  const templateFn = getEmailTemplate(communitySubdomain, templateType);
  return templateFn(params);
}
