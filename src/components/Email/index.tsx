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
  InviteEmailTemplate,
  SUBJECT as InviteEmailTemplateSubject,
} from "./templates/Invite";
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
  | "invite"
  | "update"
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder1hrProposer";

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
    case "invite":
      return {
        template: InviteEmailTemplate(props),
        subject: InviteEmailTemplateSubject,
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
