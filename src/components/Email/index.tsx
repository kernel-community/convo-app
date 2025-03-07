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
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder1hrProposer"
  | "invite-going"
  | "invite-maybe"
  | "invite-not-going"
  | "deleted-proposer"
  | "deleted-attendee"
  | "proposer-message";

export const getEmailTemplateFromType = (
  type: EmailType,
  props: EmailTemplateWithEventProps | ProposerMessageProps
): {
  template: React.ReactNode;
  subject: string;
} => {
  const { firstName, event } = props;
  const basicProps = { firstName };

  switch (type) {
    case "create":
      return {
        template: CreateEmailTemplate({ ...props }),
        subject: CreateEmailTemplateSubject,
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
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};
