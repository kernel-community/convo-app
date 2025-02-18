import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { StarryEyesEmoji } from "../components/EmailEmojis";

export const SUBJECT = "RSVP Updated: You&apos;re going to {{event.title}}";

export const UpdateAttendeeGoingEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 flex items-center gap-2 font-primary text-2xl">
        You&apos;re now going! <StarryEyesEmoji width={30} height={30} />
      </h1>

      <div className="space-y-4">
        <p>
          Hi {firstName}, we&apos;ve updated your RSVP to &quot;going&quot; for:
        </p>

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
          <p className="font-medium">What happens now:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>We&apos;ve updated your calendar invite</li>
            <li>You&apos;ll get a reminder 1 hour before</li>
            <li>The host has been notified of your update</li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
