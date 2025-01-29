import type { EmailTemplateProps } from "..";
export const SUBJECT = "A Convo you were attending has been Deleted";

export const DeletedAttendeeEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are receiving this email because your Convo has been Deleted.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
