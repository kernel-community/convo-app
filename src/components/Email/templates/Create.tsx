import type { EmailTemplateProps } from "..";

export const SUBJECT = "Your Convo has been Created";
export const CreateEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>Your Convo has been Created.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
