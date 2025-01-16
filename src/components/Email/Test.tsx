import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export type EmailType =
  | "create"
  | "invite"
  | "update"
  | "reminder24hr"
  | "reminder1hr"
  | "reminder1min"
  | "reminder1hrProposer";

export const getEmailTemplateFromType = (
  type: EmailType,
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
    case "update":
      return {
        template: UpdateEmailTemplate(props),
        subject: "Your Convo has been updated",
      };
    case "reminder24hr":
      return {
        template: Reminder24hrEmailTemplate(props),
        subject: "Reminder: Convo starting in 24hr",
      };
    case "reminder1hr":
      return {
        template: Reminder1hrEmailTemplate(props),
        subject: "Remidner: Convo starting in 1hr",
      };
    case "reminder1min":
      return {
        template: Reminder1minEmailTemplate(props),
        subject: "Reminder: Convo starting in 1min",
      };
    case "reminder1hrProposer":
      return {
        template: Reminder1hrProposerEmailTemplate(props),
        subject: "Reminder: Your Convo starting in 1hr - all RSVPs updated",
      };
  }
};

export const UpdateEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You are receiving this email because your Convo has been Updated.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);

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

export const Reminder24hrEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);

export const Reminder1hrEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);

export const Reminder1minEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <p>Hello, {firstName}!</p>
    <p>You have a Reminder for a Convo.</p>
    <p>Hedwig 🦉, at your service</p>
  </div>
);

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
