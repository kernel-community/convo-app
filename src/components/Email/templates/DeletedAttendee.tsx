import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";

export const SUBJECT = "{{event.title}} has been cancelled";

export const DeletedAttendeeEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">Convo Cancelled</h1>

      <div className="space-y-4">
        <p>
          Hi {firstName}, a Convo you were planning to attend has been
          cancelled:
        </p>

        <div className="space-y-3 rounded-lg bg-muted p-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <p>
              <strong>When:</strong>{" "}
              {new Date(event.startDateTime).toLocaleString()}
            </p>
            <p>
              <strong>Where:</strong> {event.location}
            </p>
            <p>
              <strong>Host:</strong> {event.proposerName}
            </p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            The host has cancelled this Convo. The calendar event will be
            automatically removed from your calendar.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
