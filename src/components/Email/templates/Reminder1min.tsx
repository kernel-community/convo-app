import type { EmailTemplateProps } from "..";
export const SUBJECT = "Reminder: Your Convo is in 1 minute";

export const Reminder1minEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
