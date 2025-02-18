import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "Your Convo has been updated";

export const UpdateProposerEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">Convo Details Updated</h1>

      <div className="space-y-4">
        <p>Hi {firstName}, your Convo has been updated with new details:</p>

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
          <p className="font-medium">What to do next:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Visit your dashboard to see the updated details</li>
            <li>Check if the new time and location work for you</li>
            <li>Update your RSVP if needed</li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
