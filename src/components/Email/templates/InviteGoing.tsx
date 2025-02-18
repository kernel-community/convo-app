import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { StarryEyesEmoji } from "../components/EmailEmojis";

export const SUBJECT = "You're going to {{event.title}}!";

export const InviteGoingEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 flex items-center gap-2 font-primary text-2xl">
        Yay! You&apos;re going <StarryEyesEmoji width={30} height={30} />
      </h1>

      <div className="space-y-4">
        <p>Hi {firstName}, your RSVP is confirmed for:</p>

        <div className="space-y-3 rounded-lg bg-muted p-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          {event.descriptionHtml && (
            <p
              className="text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
            />
          )}
          <EventDetails event={event} showDescription={false} />
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm">
          <p className="font-medium">Quick tips:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Add this to your calendar using the attached .ics file</li>
            <li>You&apos;ll get a reminder 1 hour before the Convo</li>
            <li>
              Need to change your RSVP? No worries, just visit the Convo page
            </li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
