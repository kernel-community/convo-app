import { RSVP_TYPE } from "@prisma/client";
import type { ClientEvent } from "src/types";
import { UserImage } from "src/components/ui/default-user-image";

export default function ViewOtherRSVPs({ event }: { event: ClientEvent }) {
  const filteredRsvps = event.uniqueRsvps.filter(
    (rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING
  );
  return (
    <>
      <div className="flex cursor-pointer -space-x-4 rtl:space-x-reverse">
        {filteredRsvps.slice(0, 3).map((rsvp, key) => {
          return (
            <UserImage
              key={key}
              photo={rsvp.attendee?.profile?.image}
              size="sm"
              userId={rsvp.attendee.id}
            />
          );
        })}
        {filteredRsvps.length - 3 > 0 && (
          <a
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800"
            href="#"
          >
            +{event.uniqueRsvps.length - 3}
          </a>
        )}
      </div>
    </>
  );
}
