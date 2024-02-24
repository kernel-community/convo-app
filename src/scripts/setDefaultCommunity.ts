/**
 * fetch all rsvps with isAddedToGoogleCalendar = false
 * if isAddedToGoogleCalendar = false, fetch the google calendar id, event id and user's email
 * attempt sending google calendar invite
 */

import { prisma } from "src/server/db";

const main = async () => {
  const kernelCommunity = await prisma.community.findUnique({
    where: { subdomain: "kernel" },
  });
  await prisma.event.updateMany({
    data: {
      communityId: kernelCommunity?.id,
    },
  });
};

main();
