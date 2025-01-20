import type { EmailTemplateProps } from "..";
export const SUBJECT = "You are invited to a Convo";

export const InviteEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are invited to a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
