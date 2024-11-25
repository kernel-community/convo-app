import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const getEmailTemplateFromType = (
  type: "create" | "invite",
  props: EmailTemplateProps
): {
  template: React.ReactNode;
  subject: string;
} => {
  switch (type) {
    case "create":
      return {
        template: CreateEmailTemplate(props),
        subject: "Your Convo has been created",
      };
    case "invite":
      return {
        template: InviteEmailTemplate(props),
        subject: "You are invited to a Convo",
      };
  }
};

export const CreateEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>Your Convo has been Created.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);

export const InviteEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are invited to a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);
