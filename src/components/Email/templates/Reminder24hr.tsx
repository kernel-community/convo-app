import type { EmailTemplateProps } from "..";
export const SUBJECT = "Reminder ATTENDEE: Your Convo is in 24 hours";

export const Reminder24hrEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
