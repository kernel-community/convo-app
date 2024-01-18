/**
 * fetch all rsvps with isAddedToGoogleCalendar = false
 * if isAddedToGoogleCalendar = false, fetch the google calendar id, event id and user's email
 * attempt sending google calendar invite
 */

import { prisma } from "src/server/db";
import { sendInvite } from "src/server/utils/google/sendInvite";

const main = async () => {
  const allRsvps = await prisma.rsvp.findMany({
    where: {
      isAddedToGoogleCalendar: false,
    },
    include: {
      event: true,
      attendee: true,
    },
  });
  for (let i = 0; i < allRsvps.length; i++) {
    const eventId = allRsvps[i]?.eventId;
    const attendeeEmail = allRsvps[i]?.attendee.email;
    const attendeeId = allRsvps[i]?.attendeeId;
    const gCalCalendarId = allRsvps[i]?.event.gCalId;
    const gCalEventId = allRsvps[i]?.event.gCalEventId;
    if (
      !eventId ||
      !attendeeEmail ||
      !attendeeId ||
      !gCalEventId ||
      !gCalCalendarId
    ) {
      continue;
    }
    try {
      await sendInvite({
        events: [eventId],
        attendeeEmail,
      });
      await prisma.rsvp.update({
        where: {
          eventId_attendeeId: {
            eventId,
            attendeeId,
          },
        },
        data: {
          isAddedToGoogleCalendar: true,
        },
      });
    } catch (err) {
      console.error(`Error sending invite to ${attendeeEmail} for ${eventId}`);
      console.error(err);
    }
    console.log(`Invite sent to ${attendeeEmail} for ${eventId}`);
  }
};
main();
