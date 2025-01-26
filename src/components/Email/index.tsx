import type * as React from "react";
import {
  Reminder24hrEmailTemplate,
  SUBJECT as Reminder24hrEmailTemplateSubject,
} from "./templates/Reminder24hr";
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
  UpdateEmailTemplate,
  SUBJECT as UpdateEmailTemplateSubject,
} from "./templates/Update";
import {
  Reminder1hrEmailTemplate,
  SUBJECT as Reminder1hrEmailTemplateSubject,
} from "./templates/Reminder1hr";
import {
  Reminder1minEmailTemplate,
  SUBJECT as Reminder1minEmailTemplateSubject,
} from "./templates/Reminder1min";
import {
  Reminder1hrProposerEmailTemplate,
  SUBJECT as Reminder1hrProposerEmailTemplateSubject,
} from "./templates/Reminder1hrProposer";

export interface EmailTemplateProps {
  firstName: string;
}

export type EmailType =
  | "create"
  | "update"
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder1hrProposer"
  | "invite-going"
  | "invite-maybe"
  | "invite-not-going";

export const getEmailTemplateFromType = (
  type: EmailType,
  props: EmailTemplateProps
): {
  template: React.ReactNode;
  subject: string;
} => {
  switch (type) {
    case "create":
      return {
        template: CreateEmailTemplate(props),
        subject: CreateEmailTemplateSubject,
      };
    case "invite-going":
      return {
        template: InviteGoingEmailTemplate(props),
        subject: InviteGoingEmailTemplateSubject,
      };
    case "invite-maybe":
      return {
        template: InviteMaybeEmailTemplate(props),
        subject: InviteMaybeEmailTemplateSubject,
      };
    case "invite-not-going":
      return {
        template: InviteNotGoingEmailTemplate(props),
        subject: InviteNotGoingEmailTemplateSubject,
      };
    case "update":
      return {
        template: UpdateEmailTemplate(props),
        subject: UpdateEmailTemplateSubject,
      };
    case "reminder24hr":
      return {
        template: Reminder24hrEmailTemplate(props),
        subject: Reminder24hrEmailTemplateSubject,
      };
    case "reminder1hr":
      return {
        template: Reminder1hrEmailTemplate(props),
        subject: Reminder1hrEmailTemplateSubject,
      };
    case "reminder1min":
      return {
        template: Reminder1minEmailTemplate(props),
        subject: Reminder1minEmailTemplateSubject,
      };
    case "reminder1hrProposer":
      return {
        template: Reminder1hrProposerEmailTemplate(props),
        subject: Reminder1hrProposerEmailTemplateSubject,
      };
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};
