import { EmailType as EmailTypeEnumDB } from "@prisma/client";
import type { EmailType } from "src/components/Email";
export const emailTypeToReminderEnum = (type: EmailType): EmailTypeEnumDB => {
  switch (type) {
    case "create":
      return EmailTypeEnumDB.CREATE;
    case "invite-going":
      return EmailTypeEnumDB.INVITE;
    case "invite-maybe":
      return EmailTypeEnumDB.INVITE;
    case "invite-not-going":
      return EmailTypeEnumDB.INVITE;
    case "update":
      return EmailTypeEnumDB.UPDATE;
    case "reminder1hr":
      return EmailTypeEnumDB.REMINDER1HR;
    case "reminder1min":
      return EmailTypeEnumDB.REMINDER1MIN;
    case "reminder24hr":
      return EmailTypeEnumDB.REMINDER24HR;
    case "reminder1hrProposer":
      return EmailTypeEnumDB.REMINDER1HRPROPOSER;
    default:
      throw new Error(`Invalid email type ${type}`);
  }
};
export const reminderEnumToEmailType = (type: EmailTypeEnumDB): EmailType => {
  switch (type) {
    case EmailTypeEnumDB.CREATE:
      return "create";
    case EmailTypeEnumDB.INVITE:
      return "invite-going";
    case EmailTypeEnumDB.UPDATE:
      return "update";
    case EmailTypeEnumDB.REMINDER1HR:
      return "reminder1hr";
    case EmailTypeEnumDB.REMINDER1MIN:
      return "reminder1min";
    case EmailTypeEnumDB.REMINDER24HR:
      return "reminder24hr";
    case EmailTypeEnumDB.REMINDER1HRPROPOSER:
      return "reminder1hrProposer";
    default:
      throw new Error(`Invalid reminder type ${type}`);
  }
};
