import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";

export const SUBJECT = "New Convo: {{event.title}}";

export const CreateEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 font-primary text-2xl">
        Hello {firstName}! Your Convo is ready 🎉
      </h1>

      <div className="space-y-4">
        <p>
          You&apos;ve successfully created a new Convo. Here are the details:
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

        <p>
          We&apos;ll notify you when people RSVP. You can always check the
          status and make updates by visiting your Convo dashboard.
        </p>
      </div>
    </div>
  </EmailWrapper>
);
