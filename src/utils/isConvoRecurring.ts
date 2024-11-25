import { prisma } from "src/utils/db";

export default async function isConvoRecurring(eventId: string) {
  const evt = await prisma.event.findUnique({ where: { id: eventId } });
  if (evt?.rrule) {
    return true;
  }
  return false;
}
