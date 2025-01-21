import type { EmailTemplateProps } from "..";
export const SUBJECT = "Reminder to the PROPOSER: Your Convo is in 1 hour";

export const Reminder1hrProposerEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, proposer {firstName}!</p>
    <p>You have a Reminder for a Convo you proposed.</p>
    <p>
      The event has been updated with all the RSVPs. Check in your cal or on
      convo.cafe
    </p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
