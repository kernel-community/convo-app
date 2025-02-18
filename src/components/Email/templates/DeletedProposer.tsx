import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "{{event.title}} has been cancelled";

export const DeletedProposerEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">Convo Cancelled</h1>

      <div className="space-y-4">
        <p>Hi {firstName}, you&apos;ve cancelled:</p>

        <div className="space-y-3 rounded-lg bg-muted p-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          {event.descriptionHtml && (
            <p
              className="text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
            />
          )}
          <EventDetails event={event} />
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            All attendees have been notified. You can always create a new Convo
            if you&apos;d like to reschedule.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
