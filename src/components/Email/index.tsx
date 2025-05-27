import type * as React from "react";
import {
  Reminder24hrEmailTemplate,
  SUBJECT as Reminder24hrEmailTemplateSubject,
} from "./templates/Reminder24hr";
import {
  Reminder72hrEmailTemplate,
  SUBJECT as Reminder72hrEmailTemplateSubject,
} from "./templates/Reminder72hr";
import {
  Reminder72hrProposerEmailTemplate,
  SUBJECT as Reminder72hrProposerEmailTemplateSubject,
} from "./templates/Reminder72hrProposer";
import {
  CreateEmailTemplate,
  SUBJECT as CreateEmailTemplateSubject,
} from "./templates/Create";
import {
  InviteGoingEmailTemplate,
  SUBJECT as InviteGoingEmailTemplateSubject,
} from "./templates/InviteGoing";
import {
  InviteMaybeEmailTemplate,
  SUBJECT as InviteMaybeEmailTemplateSubject,
} from "./templates/InviteMaybe";
import {
  InviteNotGoingEmailTemplate,
  SUBJECT as InviteNotGoingEmailTemplateSubject,
} from "./templates/InviteNotGoing";
import {
  UpdateProposerEmailTemplate,
  SUBJECT as UpdateProposerEmailTemplateSubject,
} from "./templates/UpdateProposer";
import {
  UpdateAttendeeGoingEmailTemplate,
  SUBJECT as UpdateAttendeeGoingEmailTemplateSubject,
} from "./templates/UpdateAttendeeGoing";
import {
  UpdateAttendeeMaybeEmailTemplate,
  SUBJECT as UpdateAttendeeMaybeEmailTemplateSubject,
} from "./templates/UpdateAttendeeMaybe";
import {
  EventDetailsUpdatedEmailTemplate,
  SUBJECT as EventDetailsUpdatedEmailTemplateSubject,
} from "./templates/EventDetailsUpdated";
import {
  Reminder1hrEmailTemplate,
  SUBJECT as Reminder1hrEmailTemplateSubject,
} from "./templates/Reminder1hr";
import {
  Reminder1minEmailTemplate,
  SUBJECT as Reminder1minEmailTemplateSubject,
} from "./templates/Reminder1min";
import {
  Reminder30minEmailTemplate,
  SUBJECT as Reminder30minEmailTemplateSubject,
} from "./templates/Reminder30min";
import {
  Reminder1hrProposerEmailTemplate,
  SUBJECT as Reminder1hrProposerEmailTemplateSubject,
} from "./templates/Reminder1hrProposer";
import {
  DeletedAttendeeEmailTemplate,
  SUBJECT as DeletedAttendeeEmailTemplateSubject,
} from "./templates/DeletedAttendee";
import {
  DeletedProposerEmailTemplate,
  SUBJECT as DeletedProposerEmailTemplateSubject,
} from "./templates/DeletedProposer";
import {
  ProposerMessageTemplate,
  SUBJECT as ProposerMessageTemplateSubject,
} from "./templates/ProposerMessage";

// Import the new OffWaitlist template and subject
import {
  OffWaitlistEmailTemplate,
  SUBJECT as OffWaitlistEmailTemplateSubject,
} from "./templates/OffWaitlist";

// Import the new Waitlisted template and subject
import {
  WaitlistedEmailTemplate,
  SUBJECT as WaitlistedEmailTemplateSubject,
} from "./templates/Waitlisted";

// Import approval-related templates
import {
  ApprovalRequestedEmailTemplate,
  SUBJECT as ApprovalRequestedEmailTemplateSubject,
} from "./templates/ApprovalRequested";
import {
  ApprovalApprovedEmailTemplate,
  SUBJECT as ApprovalApprovedEmailTemplateSubject,
} from "./templates/ApprovalApproved";
import {
  ApprovalRejectedEmailTemplate,
  SUBJECT as ApprovalRejectedEmailTemplateSubject,
} from "./templates/ApprovalRejected";

import type { EmailTemplateWithEventProps } from "./types";

type ProposerMessageProps = EmailTemplateWithEventProps & {
  message: string;
};

export type { EmailTemplateProps, EmailTemplateWithEventProps } from "./types";

export type EmailType =
  | "create"
  | "update-proposer"
  | "update-attendee-going"
  | "update-attendee-maybe"
  | "event-details-updated"
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder30min"
  | "reminder1hrProposer"
  | "reminder72hr"
  | "reminder72hrProposer"
  | "invite-going"
  | "invite-maybe"
  | "invite-not-going"
  | "deleted-proposer"
  | "deleted-attendee"
  | "proposer-message"
  | "off-waitlist"
  | "waitlisted"
  | "approval-requested"
  | "approval-approved"
  | "approval-rejected";

export const getEmailTemplateFromType = (
  type: EmailType,
  props: EmailTemplateWithEventProps | ProposerMessageProps
): {
  template: React.ReactNode;
  subject: string;
} => {
  // Extract props safely with type checking
  const firstName = "firstName" in props ? props.firstName : "";
  const event = "event" in props ? props.event : undefined;

  switch (type) {
    case "create":
      return {
        template: CreateEmailTemplate({ ...props }),
        subject: CreateEmailTemplateSubject,
      };
    case "reminder72hr": {
      const eventProps = props as EmailTemplateWithEventProps;
      const proposers = eventProps.event?.proposers;
      let proposerName = "Your Host"; // Default fallback

      if (proposers && proposers.length === 1) {
        proposerName = proposers[0]?.nickname ?? "Your Host";
      } else if (proposers && proposers.length === 2) {
        proposerName = `${proposers[0]?.nickname ?? "Host"} and ${
          proposers[1]?.nickname ?? "Host"
        }`;
      } else if (proposers && proposers.length > 2) {
        const remaining = proposers.length - 2;
        proposerName = `${proposers[0]?.nickname ?? "Host"}, ${
          proposers[1]?.nickname ?? "Host"
        } and ${remaining} other${remaining > 1 ? "s" : ""}`;
      }

      return {
        template: Reminder72hrEmailTemplate(eventProps),
        subject: Reminder72hrEmailTemplateSubject.replace(
          "{proposerName}",
          proposerName
        ),
      };
    }
    case "reminder72hrProposer":
      return {
        template: Reminder72hrProposerEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: Reminder72hrProposerEmailTemplateSubject,
      };
    case "invite-going":
      return {
        template: InviteGoingEmailTemplate({ ...props }),
        subject: InviteGoingEmailTemplateSubject,
      };
    case "invite-maybe":
      return {
        template: InviteMaybeEmailTemplate({ ...props }),
        subject: InviteMaybeEmailTemplateSubject,
      };
    case "invite-not-going":
      return {
        template: InviteNotGoingEmailTemplate({ ...props }),
        subject: InviteNotGoingEmailTemplateSubject,
      };
    case "update-proposer":
      return {
        template: UpdateProposerEmailTemplate({ ...props }),
        subject: UpdateProposerEmailTemplateSubject,
      };
    case "update-attendee-going":
      return {
        template: UpdateAttendeeGoingEmailTemplate({ ...props }),
        subject: UpdateAttendeeGoingEmailTemplateSubject,
      };
    case "update-attendee-maybe":
      return {
        template: UpdateAttendeeMaybeEmailTemplate({ ...props }),
        subject: UpdateAttendeeMaybeEmailTemplateSubject,
      };
    case "event-details-updated":
      return {
        template: EventDetailsUpdatedEmailTemplate({ ...props }),
        subject: EventDetailsUpdatedEmailTemplateSubject,
      };
    case "reminder24hr":
      return {
        template: Reminder24hrEmailTemplate({ ...props }),
        subject: Reminder24hrEmailTemplateSubject,
      };
    case "reminder1hr":
      return {
        template: Reminder1hrEmailTemplate({ ...props }),
        subject: Reminder1hrEmailTemplateSubject,
      };
    case "reminder1min":
      return {
        template: Reminder1minEmailTemplate({ ...props }),
        subject: Reminder1minEmailTemplateSubject,
      };
    case "reminder30min":
      return {
        template: Reminder30minEmailTemplate({ ...props }),
        subject: Reminder30minEmailTemplateSubject,
      };
    case "reminder1hrProposer":
      return {
        template: Reminder1hrProposerEmailTemplate({ ...props }),
        subject: Reminder1hrProposerEmailTemplateSubject,
      };
    case "deleted-attendee":
      return {
        template: DeletedAttendeeEmailTemplate(props),
        subject: DeletedAttendeeEmailTemplateSubject,
      };
    case "deleted-proposer":
      return {
        template: DeletedProposerEmailTemplate(props),
        subject: DeletedProposerEmailTemplateSubject,
      };
    case "proposer-message": {
      if (!("text" in props)) {
        throw new Error("Message is required for proposer-message email type");
      }
      const messageProps = {
        ...props,
        message: props.text, // Convert text prop to message prop
      } as ProposerMessageProps;
      return {
        template: ProposerMessageTemplate(messageProps),
        subject: ProposerMessageTemplateSubject,
      };
    }
    case "off-waitlist":
      return {
        template: OffWaitlistEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: OffWaitlistEmailTemplateSubject,
      };
    case "waitlisted":
      return {
        template: WaitlistedEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: WaitlistedEmailTemplateSubject,
      };
    case "approval-requested":
      return {
        template: ApprovalRequestedEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: ApprovalRequestedEmailTemplateSubject,
      };
    case "approval-approved":
      return {
        template: ApprovalApprovedEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: ApprovalApprovedEmailTemplateSubject,
      };
    case "approval-rejected":
      return {
        template: ApprovalRejectedEmailTemplate({
          ...(props as EmailTemplateWithEventProps),
        }),
        subject: ApprovalRejectedEmailTemplateSubject,
      };
    default:
      // Ensure exhaustive check - if a new type is added, this will error
      const exhaustiveCheck: never = type;
      throw new Error(`Unknown email type: ${exhaustiveCheck}`);
  }
};
