import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Can&apos;t make it to {{event.title}}";

export const InviteNotGoingEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">
        Thanks for letting us know!
      </h1>

      <div className="space-y-4">
        <p>
          Hi {firstName}, we&apos;ve noted that you won&apos;t be able to
          attend:
        </p>

        <div className="space-y-3 rounded-lg bg-muted p-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <EventDetails event={event} showDescription={false} />
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            No worries at all! We hope to catch you at another Convo soon. Feel
            free to update your RSVP if your plans change.
          </p>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
