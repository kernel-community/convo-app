import { RSVP_TYPE } from "@prisma/client";
import type { ClientEvent } from "src/types";
import { UserImage } from "src/components/ui/default-user-image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type ViewOtherRSVPsProps = {
  event: ClientEvent;
  showDetailedInfo?: boolean; // Optional prop to control detailed display
};

export default function ViewOtherRSVPs({
  event,
  showDetailedInfo = false,
}: ViewOtherRSVPsProps) {
  // We're using the isProposer flag from the event, not the user context
  const isProposer = event.isProposer || false; // Default to false if not set

  // Only show people who are going or maybe (not those who declined)
  const filteredRsvps = event.uniqueRsvps.filter(
    (rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING
  );

  return (
    <>
      <div className="flex cursor-pointer -space-x-4 rtl:space-x-reverse">
        {filteredRsvps.slice(0, 3).map((rsvp, key) => {
          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <UserImage
                      photo={rsvp.attendee?.profile?.image}
                      size="sm"
                      userId={rsvp.attendee.id}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{rsvp.attendee.nickname}</p>
                  {/* Only show RSVP status to proposers/admins */}
                  {isProposer && (
                    <p className="text-xs text-muted-foreground">
                      {rsvp.rsvpType === RSVP_TYPE.GOING ? "Going" : "Maybe"}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      {/* Display a privacy notice for non-proposers */}
      {!isProposer && showDetailedInfo && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Only event organizers can view detailed attendee information</p>
        </div>
      )}
    </>
  );
}
