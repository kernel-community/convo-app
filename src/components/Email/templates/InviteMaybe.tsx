import { EmailTemplateWithEventProps } from "../types";
import { EmailWrapper } from "../components/EmailWrapper";
import { EventDetails } from "../components/EventDetails";
import { TongueStickingOutEmoji } from "src/components/ui/emojis";

export const SUBJECT = "Tentative RSVP: {{event.title}}";

export const InviteMaybeEmailTemplate: React.FC<
  Readonly<EmailTemplateWithEventProps>
> = ({ firstName, event }) => (
  <EmailWrapper>
    <div>
      <h1 className="mb-6 flex items-center gap-2 font-primary text-2xl">
        We&apos;ll keep your spot warm{" "}
        <TongueStickingOutEmoji width={30} height={30} />
      </h1>

      <div className="space-y-4">
        <p>Hi {firstName}, you&apos;ve marked yourself as maybe attending:</p>

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
          <p className="font-medium">What this means:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              The host knows you&apos;re interested but not fully committed
            </li>
            <li>You&apos;ll still get reminders in case you can make it</li>
            <li>You can change your RSVP anytime before the Convo starts</li>
          </ul>
        </div>
      </div>
    </div>
  </EmailWrapper>
);
