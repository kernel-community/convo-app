import type { EmailTemplateProps } from "..";
export const SUBJECT = "Reminder: Your Convo is in 1 hour";

export const Reminder1hrEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
