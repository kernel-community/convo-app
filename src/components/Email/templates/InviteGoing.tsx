import type { EmailTemplateProps } from "..";
export const SUBJECT = "Your RSVP is confirmed for a Convo";

export const InviteGoingEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are invited to a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
