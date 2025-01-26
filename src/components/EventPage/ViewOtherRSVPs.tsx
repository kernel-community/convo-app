import { RSVP_TYPE } from "@prisma/client";
import type { ClientEvent } from "src/types";
import { DEFAULT_PROFILE_IMAGE } from "src/utils/constants";

export default function ViewOtherRSVPs({ event }: { event: ClientEvent }) {
  const filteredRsvps = event.uniqueRsvps.filter(
    (rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING
  );
  return (
    <>
      <div className="flex cursor-pointer -space-x-4 rtl:space-x-reverse">
        {filteredRsvps.slice(0, 3).map((rsvp, key) => {
          const photo = rsvp.attendee?.profile?.photo || DEFAULT_PROFILE_IMAGE;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
              src={photo}
              alt=""
              key={key}
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
