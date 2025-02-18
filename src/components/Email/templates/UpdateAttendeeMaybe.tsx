import type { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "{{event.title}} has been updated";

export const UpdateAttendeeMaybeEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">
        A Convo you&apos;re interested in has been updated
      </h1>

      <div className="space-y-4">
        <p>
          Hi {firstName}, {event.proposerName} has updated the details for a
          Convo you&apos;re marked as maybe attending:
        </p>

        <div className="space-y-3 rounded-lg bg-muted p-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <EventDetails event={event} />
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-sm">
          <p className="font-medium">What to do next:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>Review the new details to see if they work better for you</li>
            <li>Your RSVP is still set to &quot;maybe&quot;</li>
            <li>
              You can update your response anytime before the Convo starts
            </li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
