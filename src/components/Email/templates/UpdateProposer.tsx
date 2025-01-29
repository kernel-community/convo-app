import type { EmailTemplateProps } from "..";
export const SUBJECT = "A Convo you proposed has been Updated";

export const UpdateProposerEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are receiving this email because your Convo has been Updated.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
