import { EmailType as EmailTypeEnumDB } from "@prisma/client";
import type { EmailType } from "src/components/Email";
export const reminderEnumToEmailType = (type: EmailTypeEnumDB): EmailType => {
  switch (type) {
    case EmailTypeEnumDB.CREATE:
      return "create";
    case EmailTypeEnumDB.INVITE:
      return "invite-going";
    case EmailTypeEnumDB.UPDATE:
      return "update-attendee-going";
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
