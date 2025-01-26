import type { EmailTemplateProps } from "..";
export const SUBJECT = "Your RSVP has been marked Tentative for the Convo";

export const InviteMaybeEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are receiving this email because your Convo has been Updated.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
