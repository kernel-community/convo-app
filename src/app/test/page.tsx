"use client";

import Main from "src/layouts/Main";
import { CreateEmailTemplate } from "src/components/Email/templates/Create";
import { DeletedAttendeeEmailTemplate } from "src/components/Email/templates/DeletedAttendee";
import { DeletedProposerEmailTemplate } from "src/components/Email/templates/DeletedProposer";
import { InviteGoingEmailTemplate } from "src/components/Email/templates/InviteGoing";
import { InviteMaybeEmailTemplate } from "src/components/Email/templates/InviteMaybe";
import { InviteNotGoingEmailTemplate } from "src/components/Email/templates/InviteNotGoing";
import { Reminder1hrEmailTemplate } from "src/components/Email/templates/Reminder1hr";
import { Reminder1hrProposerEmailTemplate } from "src/components/Email/templates/Reminder1hrProposer";
import { Reminder1minEmailTemplate } from "src/components/Email/templates/Reminder1min";
import { Reminder24hrEmailTemplate } from "src/components/Email/templates/Reminder24hr";
import { UpdateAttendeeGoingEmailTemplate } from "src/components/Email/templates/UpdateAttendeeGoing";
import { UpdateAttendeeMaybeEmailTemplate } from "src/components/Email/templates/UpdateAttendeeMaybe";
import { UpdateProposerEmailTemplate } from "src/components/Email/templates/UpdateProposer";
import { EventType, LocationType } from "@prisma/client";
import { EmailTemplateWithEventProps } from "src/components/Email/types";

const mockProps: EmailTemplateWithEventProps = {
  event: {
    id: "test-id",
    title: "Coffee Chat",
    descriptionHtml: "Let's catch up and discuss the latest developments!",
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 3600000).toISOString(),
    location: "https://zoom.us/j/123456789",
    locationType: LocationType.ONLINE,
    hash: "test-hash",
    limit: 2,
    sequence: 0,
    isDeleted: false,
    gCalEventId: "abc123",
    type: EventType.JUNTO,
    proposerId: "test-proposer-id",
    proposerName: "Angela",
  },
  firstName: "Claude",
};

function EmailPreview({
  title,
  template,
}: {
  title: string;
  template: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted p-4">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="bg-white p-6">{template}</div>
    </div>
  );
}

const TestPage = () => {
  return (
    <Main className="p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-primary text-3xl font-bold">Email Templates</h1>
        </div>

        <div className="grid gap-8">
          <EmailPreview
            title="Create Event"
            template={<CreateEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Deleted Attendee"
            template={<DeletedAttendeeEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Deleted Proposer"
            template={<DeletedProposerEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Invite Going"
            template={<InviteGoingEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Invite Maybe"
            template={<InviteMaybeEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Invite Not Going"
            template={<InviteNotGoingEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="1 Hour Reminder"
            template={<Reminder1hrEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="1 Hour Reminder (Proposer)"
            template={<Reminder1hrProposerEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="1 Minute Reminder"
            template={<Reminder1minEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="24 Hour Reminder"
            template={<Reminder24hrEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Update Attendee Going"
            template={<UpdateAttendeeGoingEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Update Attendee Maybe"
            template={<UpdateAttendeeMaybeEmailTemplate {...mockProps} />}
          />
          <EmailPreview
            title="Update Proposer"
            template={<UpdateProposerEmailTemplate {...mockProps} />}
          />
        </div>
      </div>
    </Main>
  );
};

export default TestPage;
