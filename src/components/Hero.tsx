import type { ClientEvent } from "src/types";
import { InfoBox } from "./InfoBox";
import { useRef } from "react";
import {
  ChevronDown,
  MessageCircle,
  Plus,
  WrenchIcon,
  Copy,
} from "lucide-react";
import { AddRsvpCredenza } from "./AddRsvpCredenza";
import { MessageCredenza } from "./MessageCredenza";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { getDateTimeString } from "src/utils/dateTime";
import ViewOtherRSVPs from "./EventPage/ViewOtherRSVPs";
import Link from "next/link";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "src/components/ui/credenza";
import { cn } from "src/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "src/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { UserImage } from "./ui/default-user-image";
import { EventCard, EventsView } from "./ui/event-list";
// import { parseConvoLocation } from "src/utils/parseConvoLocation";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import type { User } from "@prisma/client";
import { RSVP_TYPE } from "@prisma/client";
// import useUpdateRsvp from "src/hooks/useUpdateRsvp";
import useUserRsvpForConvo from "src/hooks/useUserRsvpForConvo";
import Signature from "./EventPage/Signature";
import FieldLabel from "./EventPage/RsvpConfirmationForm/FieldLabel";
import LoginButton from "./LoginButton";
import { rsvpTypeToEmoji } from "src/utils/rsvpTypeToEmoji";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cleanupRruleString } from "src/utils/cleanupRruleString";
import { rrulestr } from "rrule";
import { ArrowUpRight } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { XIcon } from "lucide-react";
import { ProposerSearchCombobox } from "./ProposerSearchCombobox";
import { toast } from "react-hot-toast";
import { FancyHighlight } from "./FancyHighlight";
import { DateTime } from "luxon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ApprovalManagementAccordion } from "./ApprovalManagementAccordion";
import { getUserImage } from "src/utils/getUserProfile";
// Dialog components removed as we're now using a tooltip

const When = ({
  event,
  className,
}: {
  event: ClientEvent;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Determine if event timezone is different from user's local timezone
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const eventTimezone = event.creationTimezone || localTimezone;
  console.log({ eventTimezone, localTimezone });
  const isDifferentTimezone = eventTimezone !== localTimezone;
  console.log({ isDifferentTimezone });

  return (
    <>
      <Credenza open={isOpen} onOpenChange={setIsOpen}>
        <CredenzaContent className="flex h-[42rem] max-w-[30rem] flex-col  sm:h-[40rem]">
          <CredenzaHeader>
            <CredenzaTitle>when</CredenzaTitle>
            <CredenzaDescription>
              starts on {getDateTimeString(event.startDateTime, "date")}
              {", "}
              {getDateTimeString(event.startDateTime, "time")}
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="w-full flex-1 overflow-y-auto">
            <div className="min-w-100 flex h-full flex-col gap-2">
              {event.recurrenceRule ? (
                <EventsView
                  rruleStr={event.recurrenceRule}
                  startDateTime={event.startDateTime}
                  creationTimezone={event.creationTimezone ?? undefined}
                />
              ) : (
                <EventCard date={new Date(event.startDateTime)} />
              )}
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <CredenzaClose className="w-full">
              <Button className="w-full">Close</Button>
            </CredenzaClose>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
      <Card
        className={cn(
          "cursor-pointer border-2 border-border bg-background font-secondary text-foreground duration-300 hover:border-foreground",
          className
        )}
        onClick={() => (event.recurrenceRule ? setIsOpen(!isOpen) : null)}
      >
        <CardHeader>
          <CardTitle className="text-base">when</CardTitle>
        </CardHeader>
        <CardContent>
          {isDifferentTimezone ? (
            <div className="group relative inline-block">
              {/* The trigger element with dotted underline */}
              <div
                className="cursor-pointer underline decoration-dotted underline-offset-4"
                tabIndex={0} // Make it focusable for accessibility
                role="button"
                aria-label="Show timezone information"
              >
                {getFormattedDateOrTime(event.startDateTime, "date")}
                {", "}
                {getFormattedDateOrTime(event.startDateTime, "time")}{" "}
                <span className="text-sm">({localTimezone})</span>
              </div>
              <span className="text-xs text-muted-foreground">
                (original time proposed in {event.creationTimezone})
              </span>

              {/* Tooltip content */}
              <div className="invisible absolute left-0 top-full z-10 mt-2 w-72 rounded-md border border-border bg-background p-4 shadow-lg transition-opacity duration-300 group-focus-within:visible group-hover:visible md:w-80">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">
                    Time Zone Information
                  </h3>

                  <div>
                    <h4 className="mb-1 text-xs font-bold">
                      Original time in {event.creationTimezone}:
                    </h4>
                    <p className="text-sm text-primary">
                      {event.creationTimezone &&
                        formatTimeInTimezone(
                          event.startDateTime,
                          event.creationTimezone
                        )}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-1 text-xs font-bold">
                      Your local time ({localTimezone}):
                    </h4>
                    <p className="text-sm">
                      {formatTimeInTimezone(event.startDateTime, localTimezone)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {getFormattedDateOrTime(event.startDateTime, "date")}
              {", "}
              {getFormattedDateOrTime(event.startDateTime, "time")}
            </div>
          )}
          {event.recurrenceRule && (
            <div>
              <span className="text-sm font-semibold text-gray-500">
                repeats:{" "}
              </span>
              <span className="text-sm font-semibold text-gray-500">
                {rrulestr(cleanupRruleString(event.recurrenceRule)).toText()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const Where = ({
  event,
  isUserGoing,
  className,
  isOwnerOfConvo,
}: {
  event: ClientEvent;
  isUserGoing: boolean;
  className?: string;
  isOwnerOfConvo: boolean;
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer border-2 border-border bg-background font-secondary text-foreground duration-300 hover:border-foreground",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-base">where</CardTitle>
        {!isUserGoing && (
          <CardDescription>
            <span className="text-xs text-gray-500"> </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-slate-400/10 px-2 py-1 text-sm text-gray-500 transition-all duration-300 hover:bg-slate-400/20">
          {(isUserGoing || isOwnerOfConvo) && event.location && (
            <LocationDisplay location={event.location} />
          )}

          {!(isUserGoing || isOwnerOfConvo) && (
            <span className="text-sm text-gray-500">RSVP to see location</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const LocationDisplay = ({ location }: { location: string }) => {
  const isUrl = isValidUrl(location);
  const truncatedLocation = truncateText(location, 50);

  return isUrl ? (
    <a
      href={location}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    >
      {truncatedLocation}
    </a>
  ) : (
    <span>{truncatedLocation}</span>
  );
};

// Helper functions
const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const WhoElseIsGoing = ({
  event,
  isUserGoing,
  isOwnerOfConvo,
  className,
  totalAvailableSeats,
  totalSeats,
  noModal,
}: {
  event: ClientEvent;
  isUserGoing: boolean;
  isOwnerOfConvo: boolean;
  className?: string;
  totalAvailableSeats: number;
  totalSeats: number;
  noModal?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { fetchedUser } = useUser();

  const attendees = event.rsvps.filter(
    (rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING
  );

  const hasRsvps = attendees.length > 0;
  const waitlistCount = event.waitlistCount || 0;
  const isWaitlisted = event.isCurrentUserWaitlisted;

  // Filter RSVPs based on permissions
  const filteredRsvps = (() => {
    if (isOwnerOfConvo) {
      // Proposers can see all RSVPs
      return event.rsvps;
    } else if (isUserGoing) {
      // Users who are going can see all going/maybe RSVPs but not not_going
      return event.rsvps.filter(
        (rsvp) =>
          rsvp.rsvpType === RSVP_TYPE.GOING || rsvp.rsvpType === RSVP_TYPE.MAYBE
      );
    } else {
      // Users who aren't going can only see going RSVPs
      return event.rsvps.filter((rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING);
    }
  })();

  const othersOnWaitlist = Math.max(0, waitlistCount - (isWaitlisted ? 1 : 0));

  return (
    <>
      {noModal && filteredRsvps.length > 0 && (
        <ViewOtherRSVPs event={event} showDetailedInfo={isOwnerOfConvo} />
      )}
      {!noModal && (
        <Credenza open={open} onOpenChange={setOpen}>
          <CredenzaContent className="w-full max-w-md">
            <CredenzaHeader>
              <CredenzaTitle>Event Attendees</CredenzaTitle>
              <CredenzaDescription>
                {totalSeats > 0
                  ? `${totalAvailableSeats} of ${totalSeats} seats available`
                  : "No seat limit"}
              </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody className="max-h-96 space-y-2 overflow-y-auto">
              {filteredRsvps.map((rsvp, key) => {
                const isCurrentUser = fetchedUser.id === rsvp.attendee.id;
                return (
                  <div
                    key={key}
                    className="my-2 flex flex-row items-center gap-3"
                  >
                    <UserImage
                      photo={getUserImage(rsvp.attendee)}
                      size="md"
                      userId={rsvp.attendee.id}
                    />
                    {isCurrentUser ? (
                      <span>
                        <span className="font-bold">You</span>
                        <span> ({rsvp.attendee.nickname})</span>
                      </span>
                    ) : (
                      <span>{rsvp.attendee.nickname}</span>
                    )}
                    {/* Show RSVP status based on permissions */}
                    {(isOwnerOfConvo || isCurrentUser) && (
                      <span>{rsvpTypeToEmoji(rsvp.rsvpType)}</span>
                    )}

                    {/* Show admin badge for proposers */}
                    {isOwnerOfConvo &&
                      event.proposers.some(
                        (p) => p.userId === rsvp.attendee.id
                      ) && (
                        <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Organizer
                        </span>
                      )}
                  </div>
                );
              })}
            </CredenzaBody>
            {/* Display waitlist status inside the modal if the user is waitlisted */}
            {isWaitlisted && (
              <CredenzaFooter className="border-t pt-3 text-sm font-medium text-foreground">
                <div className="flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>
                    You are currently on the waitlist
                    {othersOnWaitlist > 0
                      ? ` along with ${othersOnWaitlist} other${
                          othersOnWaitlist > 1 ? "s" : ""
                        }`
                      : ""}
                    .
                  </span>
                </div>
              </CredenzaFooter>
            )}
            <CredenzaFooter>
              <CredenzaClose className="w-full">
                <Button className="w-full">Close</Button>
              </CredenzaClose>
            </CredenzaFooter>
          </CredenzaContent>
        </Credenza>
      )}
      <Card
        onClick={() => (hasRsvps ? setOpen(!open) : null)}
        className={cn(
          `${
            noModal ? "" : "cursor-pointer"
          } border-2 border-border bg-background font-secondary text-foreground duration-300 hover:border-foreground`,
          className
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">who else is going</CardTitle>
          <CardDescription>
            {totalSeats > 0
              ? `${totalAvailableSeats} of ${totalSeats} seats available`
              : "No Seat Limit"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasRsvps ? (
            <ViewOtherRSVPs event={event} showDetailedInfo={isOwnerOfConvo} />
          ) : (
            <div className="text-sm text-gray-500">No RSVPs yet</div>
          )}
          {isWaitlisted && (
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-yellow-100 p-2 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4" />
              <span>You&apos;re on the waitlist ({waitlistCount} total)</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const RSVP_TYPE_MESSAGES = {
  [RSVP_TYPE.GOING]: (
    <>
      You are currently marked as{" "}
      <span className="underline decoration-dotted underline-offset-4">
        Going
      </span>
    </>
  ),
  [RSVP_TYPE.MAYBE]: (
    <>
      You are currently marked as{" "}
      <span className="underline decoration-dotted underline-offset-4">
        Maybe
      </span>
    </>
  ),
  [RSVP_TYPE.NOT_GOING]: (
    <>
      You are currently marked as{" "}
      <span className="underline decoration-dotted underline-offset-4">
        Not Going
      </span>
    </>
  ),
} as const;

const ConvoSeats = ({
  totalAvailableSeats,
  totalSeats,
  isSignedIn,
}: {
  totalAvailableSeats: number;
  totalSeats: number;
  isSignedIn: boolean;
}) => {
  if (totalSeats === 0) return null;
  return (
    <div className="my-2 rounded-md border border-gray-500 p-2">
      {totalAvailableSeats} of {totalSeats} seats available.{" "}
      {isSignedIn ? `When you RSVP as "Maybe" a seat is NOT reserved` : ""}
    </div>
  );
};

const RSVP = ({
  event,
  className,
  totalAvailableSeats,
  totalSeats,
  isOwnerOfConvo,
  onRsvpAttempt,
  isRsvpUpdating,
}: {
  event: ClientEvent;
  className?: string;
  totalAvailableSeats: number;
  totalSeats: number;
  isOwnerOfConvo: boolean;
  onRsvpAttempt: (type: RSVP_TYPE) => void;
  isRsvpUpdating: boolean;
}) => {
  const { rsvp } = useUserRsvpForConvo({ hash: event.hash });
  const { fetchedUser } = useUser();
  const [rsvpType, setRsvpType] = useState<RSVP_TYPE>(RSVP_TYPE.GOING);

  const onRsvpTypeChange = (rsvpType: RSVP_TYPE) => {
    setRsvpType(rsvpType);
  };

  useEffect(() => {
    setRsvpType(rsvp ? rsvp.rsvpType : RSVP_TYPE.GOING);
  }, [rsvp]);

  // Function to get display text for current RSVP/approval status
  const getCurrentRsvpTypeToString = () => {
    const type = rsvp?.rsvpType;

    // If user has an existing RSVP, show that status
    if (
      type === RSVP_TYPE.GOING ||
      type === RSVP_TYPE.MAYBE ||
      type === RSVP_TYPE.NOT_GOING
    ) {
      return RSVP_TYPE_MESSAGES[type];
    }

    // If event requires approval, show approval status instead of generic "not RSVPed"
    if (event.requiresApproval && event.userApprovalRequest) {
      if (event.userApprovalRequest.status === "PENDING") {
        return (
          <>
            Your request to join is{" "}
            <span className="underline decoration-dotted underline-offset-4">
              pending approval
            </span>
          </>
        );
      } else if (event.userApprovalRequest.status === "APPROVED") {
        return (
          <>
            Your request has been{" "}
            <span className="text-green-600 underline decoration-dotted underline-offset-4">
              approved
            </span>{" "}
            - you can now RSVP
          </>
        );
      } else if (event.userApprovalRequest.status === "REJECTED") {
        return (
          <>
            Your previous request was{" "}
            <span className="text-red-600 underline decoration-dotted underline-offset-4">
              not approved
            </span>
          </>
        );
      }
    }

    // Fallback for no RSVP or approval request
    return (
      <>
        You have not{" "}
        <span className="underline decoration-dotted underline-offset-4">
          RSVPed
        </span>{" "}
        yet
      </>
    );
  };

  // Determine if event is full (limited and no seats left)
  const isFull = totalAvailableSeats <= 0 && totalSeats > 0;
  // Determine if current user is already waitlisted
  const isWaitlisted = event.isCurrentUserWaitlisted;

  if (isOwnerOfConvo) {
    return null;
  }
  if (!fetchedUser.isSignedIn) {
    return (
      <Card
        className={cn(
          "cursor-pointer border-2 border-border bg-background text-foreground duration-300",
          className
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">Login to RSVP</CardTitle>
        </CardHeader>
        <CardContent>
          <ConvoSeats
            totalAvailableSeats={totalAvailableSeats}
            totalSeats={totalSeats}
            isSignedIn={false}
          />
          <LoginButton className="w-full" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card
      className={cn(
        "cursor-pointer border-2 border-border bg-background text-foreground duration-300",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-base">
          {getCurrentRsvpTypeToString()}
        </CardTitle>
        {/* Approval Status Display - More prominent placement */}
        {event.requiresApproval && event.userApprovalRequest && (
          <div
            className={`mt-3 rounded-lg border border-l-4 p-3 ${
              event.userApprovalRequest.status === "PENDING"
                ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : event.userApprovalRequest.status === "APPROVED"
                ? "border-l-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-l-red-500 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  event.userApprovalRequest.status === "PENDING"
                    ? "bg-yellow-500"
                    : event.userApprovalRequest.status === "APPROVED"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  event.userApprovalRequest.status === "PENDING"
                    ? "text-yellow-800 dark:text-yellow-200"
                    : event.userApprovalRequest.status === "APPROVED"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {event.userApprovalRequest.status === "PENDING" &&
                  "Approval Pending"}
                {event.userApprovalRequest.status === "APPROVED" &&
                  "Request Approved"}
                {event.userApprovalRequest.status === "REJECTED" &&
                  "Request Rejected"}
              </span>
            </div>
            <p
              className={`mt-2 text-sm ${
                event.userApprovalRequest.status === "PENDING"
                  ? "text-yellow-700 dark:text-yellow-300"
                  : event.userApprovalRequest.status === "APPROVED"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {event.userApprovalRequest.status === "PENDING" &&
                "Your RSVP request is waiting for organizer approval."}
              {event.userApprovalRequest.status === "APPROVED" &&
                "Your RSVP request has been approved! You can now complete your RSVP below."}
              {event.userApprovalRequest.status === "REJECTED" &&
                "Your RSVP request was not approved. You can submit a new request if you'd like."}
              {event.userApprovalRequest.reviewMessage && (
                <span className="mt-2 block border-l-2 border-gray-400 pl-3 text-sm italic opacity-80">
                  &quot;{event.userApprovalRequest.reviewMessage}&quot;
                </span>
              )}
            </p>
          </div>
        )}
        <CardDescription className="mt-3">
          Please update your RSVP here in the app, not through your calendar.
          While you&apos;ll receive calendar invites by email, responses made in
          your calendar won&apos;t reflect back to the proposer of this Convo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConvoSeats
          totalAvailableSeats={totalAvailableSeats}
          totalSeats={totalSeats}
          isSignedIn={true}
        />

        {/* Conditional rendering based on event capacity */}
        {isFull ? (
          // Event is full - Show Waitlist Button OR Leave Waitlist Button
          <div className="mt-4 flex flex-col items-center">
            <Button
              onClick={() => {
                onRsvpAttempt(
                  isWaitlisted ? RSVP_TYPE.NOT_GOING : RSVP_TYPE.GOING
                );
              }}
              className="w-full"
              disabled={
                isRsvpUpdating ||
                (event.requiresApproval &&
                  event.userApprovalRequest?.status === "PENDING")
              }
              isLoading={isRsvpUpdating}
              variant={isWaitlisted ? "destructive" : "default"}
            >
              {(() => {
                if (isWaitlisted) {
                  return "Leave Waitlist";
                }

                // For approval-required events, adjust waitlist button text
                if (event.requiresApproval) {
                  if (event.userApprovalRequest?.status === "PENDING") {
                    return "Request Pending";
                  } else if (event.userApprovalRequest?.status === "APPROVED") {
                    return "Join Waitlist";
                  } else {
                    return "Request to Join Waitlist";
                  }
                }

                return "Join Waitlist";
              })()}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {isWaitlisted
                ? "You won't be notified if a spot opens up."
                : event.requiresApproval && !event.userApprovalRequest?.status
                ? "The event is full. Request approval to join the waitlist."
                : event.requiresApproval &&
                  event.userApprovalRequest?.status === "PENDING"
                ? "Your approval request is pending."
                : "The event is full. Join the waitlist to be notified if a spot opens up."}
            </p>
          </div>
        ) : (
          // Event has space - Show RSVP options
          <>
            {/* MOVE RadioGroup and Signing As INSIDE this fragment */}
            <RadioGroup className="flex flex-col gap-6 text-gray-500 sm:flex-row">
              {/* Radio options (Going, Maybe, Not Going) */}
              <div
                className={cn(
                  "flex cursor-pointer flex-row items-center gap-2 px-4 py-2",
                  rsvp?.rsvpType === RSVP_TYPE.GOING &&
                    "rounded-full border-2 border-foreground",
                  rsvpType === RSVP_TYPE.GOING && "rounded-full bg-muted"
                )}
              >
                <RadioGroupItem
                  value="going"
                  id="going"
                  checked={rsvpType === RSVP_TYPE.GOING}
                  onClick={() => onRsvpTypeChange(RSVP_TYPE.GOING)}
                />
                <Label htmlFor="going">Going</Label>
              </div>
              {/* ... Maybe option ... */}
              <div
                className={cn(
                  "flex cursor-pointer flex-row items-center gap-2 px-4 py-2",
                  rsvp?.rsvpType === RSVP_TYPE.MAYBE &&
                    "rounded-full border-2 border-foreground bg-muted",
                  rsvpType === RSVP_TYPE.MAYBE && "rounded-full bg-muted"
                )}
              >
                <RadioGroupItem
                  value="maybe"
                  id="maybe"
                  checked={rsvpType === RSVP_TYPE.MAYBE}
                  onClick={() => onRsvpTypeChange(RSVP_TYPE.MAYBE)}
                />
                <Label htmlFor="maybe">Maybe</Label>
              </div>
              {/* ... Not Going option ... */}
              <div
                className={cn(
                  "flex cursor-pointer flex-row items-center gap-2 px-4 py-2",
                  rsvp?.rsvpType === RSVP_TYPE.NOT_GOING &&
                    "rounded-full border-2 border-foreground bg-muted",
                  rsvpType === RSVP_TYPE.NOT_GOING && "rounded-full bg-muted"
                )}
              >
                <RadioGroupItem
                  value="not-going"
                  id="not-going"
                  checked={rsvpType === RSVP_TYPE.NOT_GOING}
                  onClick={() => onRsvpTypeChange(RSVP_TYPE.NOT_GOING)}
                />
                <Label htmlFor="not-going">Not going</Label>
              </div>
            </RadioGroup>
            {fetchedUser.isSignedIn && (
              <div className="mt-6">
                <FieldLabel>Signing as</FieldLabel>
                <div className="flex flex-row gap-3">
                  <Signature user={fetchedUser as User} style="fancy" />
                </div>
              </div>
            )}
            {/* Regular RSVP/Update Button */}
            <Button
              onClick={() => {
                onRsvpAttempt(rsvpType);
              }}
              className="mt-4 w-full"
              disabled={
                isRsvpUpdating ||
                (event.requiresApproval &&
                  event.userApprovalRequest?.status === "PENDING")
              }
              isLoading={isRsvpUpdating}
            >
              {(() => {
                // If user has an existing RSVP, always show "Update RSVP"
                if (rsvp) {
                  return "Update RSVP";
                }

                // If event requires approval and user has a pending request, disable button
                if (
                  event.requiresApproval &&
                  event.userApprovalRequest?.status === "PENDING"
                ) {
                  return "Request Pending";
                }

                // If event requires approval and user has a rejected request, allow new request
                if (
                  event.requiresApproval &&
                  event.userApprovalRequest?.status === "REJECTED"
                ) {
                  return "Request Again";
                }

                // If event requires approval and user has approved request, show regular RSVP (shouldn't happen but fallback)
                if (
                  event.requiresApproval &&
                  event.userApprovalRequest?.status === "APPROVED"
                ) {
                  return "RSVP";
                }

                // If event requires approval and no existing request, show request button
                if (event.requiresApproval && !event.userApprovalRequest) {
                  return "Request to Join";
                }

                // Default case for non-approval events
                return "RSVP";
              })()}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Hero = ({
  isImported,
  isDeleted,
  event,
  onRsvpAttempt,
  isRsvpUpdating,
}: {
  isImported?: boolean;
  isDeleted?: boolean;
  event: ClientEvent;
  onRsvpAttempt: (type: RSVP_TYPE) => void;
  isRsvpUpdating: boolean;
}) => {
  const isPartOfCollection = event.collections.length > 0;
  const collectionHrefs = event.collections.map((c, k) => (
    <Link key={k} href={`/collection/${c.id}`}>
      {" "}
      <span className="text-primary underline decoration-dotted">{c.name}</span>
      {k + 1 !== event.collections.length ? "," : ""}
    </Link>
  ));
  const { fetchedUser } = useUser();
  // const isOwnerOfConvo = fetchedUser?.id === event.proposerId; // REMOVED
  // Check if the fetched user is present in the event's proposers array
  const isOwnerOfConvo = event.proposers.some(
    (p) => p.userId === fetchedUser?.id
  ); // ADDED
  const isKernelCommunityMember = fetchedUser?.isKernelCommunityMember;
  const { rsvp: userRsvp } = useUserRsvpForConvo({ hash: event.hash });
  const isUserGoing =
    userRsvp?.rsvpType === RSVP_TYPE.GOING ||
    userRsvp?.rsvpType === RSVP_TYPE.MAYBE;
  const totalAvailableSeats = Math.max(
    0,
    event.limit -
      event.rsvps.filter((rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING).length
  );
  const totalSeats = event.limit;
  console.log({ event });
  return (
    <div className="flex w-full flex-col justify-items-start">
      <div
        className="
          w-full
          font-primary
          text-3xl
          font-semibold
        "
      >
        {event?.title}
      </div>

      {event.community && (
        <div className="text-md mt-1 font-primary italic text-muted-foreground">
          created for the{" "}
          <a
            className="cursor-pointer font-semibold underline decoration-dotted underline-offset-4"
            href={`/community/${event.community.subdomain}`}
          >
            {event.community.displayName}
          </a>{" "}
          community.
        </div>
      )}

      {(isKernelCommunityMember || isOwnerOfConvo) && (
        <motion.div
          className="my-4 w-full space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AdminMetricsAccordion event={event} />
          {event.requiresApproval && fetchedUser && (
            <ApprovalManagementAccordion
              eventId={event.id}
              currentUser={fetchedUser as any}
            />
          )}
        </motion.div>
      )}

      {isPartOfCollection && (
        <div className="my-4 font-primary text-gray-500">
          {`This event is part of ${
            event.collections.length > 1 ? "" : "the "
          } collection${event.collections.length > 1 ? "s" : ""}:`}
          {collectionHrefs}
        </div>
      )}

      <div
        className={cn(
          "grid w-full grid-cols-1 gap-3 py-4",
          isUserGoing || isOwnerOfConvo ? "sm:grid-cols-3" : "sm:grid-cols-2"
        )}
      >
        <When event={event} />
        <Where
          event={event}
          isUserGoing={isUserGoing}
          isOwnerOfConvo={isOwnerOfConvo}
        />
        {isUserGoing || isOwnerOfConvo ? (
          <WhoElseIsGoing
            event={event}
            isUserGoing={isUserGoing}
            isOwnerOfConvo={isOwnerOfConvo}
            totalAvailableSeats={totalAvailableSeats}
            totalSeats={totalSeats}
          />
        ) : null}
        <RSVP
          event={event}
          className={cn(
            "col-span-1",
            isUserGoing || isOwnerOfConvo ? "sm:col-span-3" : "sm:col-span-2"
          )}
          totalAvailableSeats={totalAvailableSeats}
          totalSeats={totalSeats}
          isOwnerOfConvo={isOwnerOfConvo}
          onRsvpAttempt={onRsvpAttempt}
          isRsvpUpdating={isRsvpUpdating}
        />
      </div>

      {isImported && (
        <InfoBox type="warning">
          This event was imported. The number of RSVPs might not be correct.
        </InfoBox>
      )}
      {isDeleted && (
        <InfoBox type="error">
          This event has been canceled by the proposer.
        </InfoBox>
      )}
    </div>
  );
};

const RSVP_STATUS_MAP = {
  GOING: "Going",
  NOT_GOING: "Not Going",
  MAYBE: "Maybe",
} as const;

// Define type for fetched users in dropdown
type DropdownUser = {
  id: string;
  nickname: string;
  image: string | null;
};

const AdminMetricsAccordion = ({ event }: { event: ClientEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAddRsvp, setShowAddRsvp] = useState(false);
  const [showMessageConfirm, setShowMessageConfirm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAddingProposer, setIsAddingProposer] = useState(false);
  const [isRemovingProposer, setIsRemovingProposer] = useState<string | null>(
    null
  );
  const [isUpdatingRsvp, setIsUpdatingRsvp] = useState<string | null>(null);
  const { fetchedUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Calculate existing proposer IDs set to pass to combobox
  const existingProposerIds = new Set(event.proposers.map((p) => p.userId));

  // Function to handle updating RSVP status for another user
  const handleUpdateRsvpStatus = async (
    rsvpId: string,
    userId: string,
    newStatus: "GOING" | "NOT_GOING" | "MAYBE"
  ) => {
    try {
      setIsUpdatingRsvp(rsvpId);
      const response = await fetch("/api/create/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvp: {
            userId: userId,
            eventId: event.id,
            type: newStatus,
            adminOverride: true, // Flag to indicate this is an admin action
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      // Success - refresh the page to show updated RSVP status
      window.location.reload();
    } catch (error) {
      console.error("Error updating RSVP status:", error);
    } finally {
      setIsUpdatingRsvp(null);
    }
  };

  const handleAddProposer = async () => {
    if (!selectedUserId) {
      console.error("Please select a user to add.");
      return;
    }
    setIsAddingProposer(true);
    try {
      const response = await fetch("/api/manage/proposers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          newProposerUserId: selectedUserId,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to add proposer");
      console.log(result.message || "Co-proposer added!");
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error adding co-proposer:", error);
      console.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsAddingProposer(false);
    }
  };

  const handleRemoveProposer = async (proposerUserIdToRemove: string) => {
    setIsRemovingProposer(proposerUserIdToRemove);
    try {
      const response = await fetch("/api/manage/proposers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, proposerUserIdToRemove }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to remove proposer");
      console.log(result.message || "Co-proposer removed!");
    } catch (error) {
      console.error("Error removing co-proposer:", error);
      console.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsRemovingProposer(null);
    }
  };

  const handleSendMessage = async () => {
    try {
      setIsSending(true);
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients:
            fetchedUser && // CORRECTED: Use fetchedUser from context
            !filteredRsvps.some(
              (rsvp: (typeof event.rsvps)[number]) =>
                rsvp.attendee.id === fetchedUser.id // CORRECTED: Use fetchedUser from context
            )
              ? [
                  ...filteredRsvps,
                  { attendee: fetchedUser }, // CORRECTED: Use fetchedUser from context
                ]
              : filteredRsvps,
          event,
          message,
        }),
      });
      if (!response.ok) throw new Error("Failed to send");
      setShowMessageConfirm(false);
      setShowMessageInput(false);
      setMessage("");
      console.log("Message sent!");
    } catch (err) {
      console.error(err);
      console.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  // Calculate filteredRsvps immediately after dependencies are available
  const filteredRsvps = event.rsvps.filter((rsvp) =>
    rsvpFilter === "all" ? true : rsvp.rsvpType === rsvpFilter
  );

  // useEffect for resetting message input (Depends on filteredRsvps)
  useEffect(() => {
    // Now filteredRsvps is guaranteed to be initialized here
    if (filteredRsvps.length === 0) {
      setShowMessageInput(false);
      setMessage("");
    }
  }, [filteredRsvps.length]);

  // useEffect for scroll indicator (Depends on isOpen, rsvpFilter)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const checkScroll = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      const isScrolled = container.scrollTop > 0;
      setShowScrollIndicator(hasOverflow && !isScrolled);
    };
    checkScroll();
    container.addEventListener("scroll", checkScroll);
    const observer = new ResizeObserver(checkScroll);
    if (container) observer.observe(container);
    return () => {
      if (container) container.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [isOpen, rsvpFilter]);

  // No need to find selected user object here

  // Log state and key prop just before render
  console.log(
    `[AdminMetricsAccordion Render] Event ID: ${event.id}, Selected User ID: ${selectedUserId}`
  );

  return (
    <motion.div
      className="group rounded-md border-2 border-secondary bg-background p-4 text-foreground"
      initial={false}
      animate={{
        borderRadius: isOpen ? "0.75rem" : "0.75rem",
      }}
    >
      <motion.div
        className="flex cursor-pointer items-center justify-between gap-2 font-secondary text-base font-semibold text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="inline-flex items-center gap-2">
          Manage Event <WrenchIcon className="h-4 w-4" />{" "}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.1 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="mt-4 space-y-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.2,
                },
                opacity: {
                  duration: 0.3,
                  delay: 0.08,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                },
                opacity: {
                  duration: 0.2,
                },
              },
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex-inline my-4 flex w-full items-center justify-between rounded-xl bg-secondary-muted p-3 font-secondary text-base text-secondary-foreground">
              <span>Edit Convo Details</span>
              <a
                href={`/edit/${event.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-inline flex items-center rounded-full border-2 bg-primary px-2 text-primary-foreground transition-all duration-300 hover:border-primary"
              >
                Edit <ArrowUpRight className="h-4" />
              </a>
            </div>
            <div className="border-foreground/20 space-y-2 border-t-2 pt-6">
              <h3 className="text-primary-foreground/90 font-secondary text-sm font-semibold">
                RSVP Statistics
              </h3>
              <div className="grid grid-cols-1 gap-4 rounded-lg bg-white/10 p-3 text-sm backdrop-blur-sm sm:grid-cols-3">
                <div>
                  <p className="text-primary-foreground/60">RSVPs</p>
                  <p>
                    {
                      event.rsvps.filter((r) => r.rsvpType !== "NOT_GOING")
                        .length
                    }
                  </p>
                </div>
                <div>
                  <p className="text-primary-foreground/60">Capacity</p>
                  <p>{event.limit === 0 ? "Unlimited" : event.limit}</p>
                </div>
                <div>
                  <p className="text-primary-foreground/60">Available Seats</p>
                  <p>
                    {event.limit === 0
                      ? "Unlimited"
                      : event.limit - event.rsvps.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between gap-2 border-t-2 py-3 text-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-foreground/60">
                      Filter / Message RSVPs:{" "}
                    </span>
                    <select
                      value={rsvpFilter}
                      onChange={(e) => setRsvpFilter(e.target.value)}
                      className="focus:ring-highlight/50 rounded-md border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All</option>
                      <option value="GOING">Going</option>
                      <option value="NOT_GOING">Not Going</option>
                      <option value="MAYBE">Maybe</option>
                    </select>
                  </div>
                  {filteredRsvps.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowMessageInput(!showMessageInput)}
                        className="bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-primary-foreground transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message?
                      </button>
                      <button
                        onClick={() => {
                          const emails = filteredRsvps
                            .map((rsvp) => rsvp.attendee.email)
                            .join(", ");
                          navigator.clipboard.writeText(emails);
                          toast.success(
                            `${filteredRsvps.length} email${
                              filteredRsvps.length === 1 ? "" : "s"
                            } copied to clipboard`
                          );
                        }}
                        className="bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-primary-foreground transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Emails
                      </button>
                      <MessageCredenza
                        isOpen={showMessageConfirm}
                        onClose={() => setShowMessageConfirm(false)}
                        recipients={filteredRsvps}
                        message={message}
                        isLoading={isSending}
                        onSend={handleSendMessage}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    onClick={() => setShowAddRsvp(true)}
                    size="sm"
                    className="gap-1"
                    variant={"outline"}
                  >
                    <Plus className="h-4 w-4" />
                    Add RSVP
                  </Button>

                  <AddRsvpCredenza
                    isOpen={showAddRsvp}
                    onClose={() => setShowAddRsvp(false)}
                    eventId={event.id}
                    onSuccess={() => {
                      // Refresh the page to show new RSVP
                      // window.location.reload();
                    }}
                  />
                </div>
              </div>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: showMessageInput ? "auto" : 0,
                  opacity: showMessageInput ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mb-4 space-y-3 rounded-lg p-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="placeholder:text-foreground/50 w-full rounded-lg border border-primary p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      if (message.trim()) {
                        setShowMessageConfirm(true);
                      }
                    }}
                    className="hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!message.trim()}
                  >
                    Send to{" "}
                    {rsvpFilter === "all"
                      ? "all RSVPs"
                      : `${
                          RSVP_STATUS_MAP[
                            rsvpFilter as keyof typeof RSVP_STATUS_MAP
                          ]
                        } RSVPs`}{" "}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
              <div
                ref={scrollContainerRef}
                className="scrollbar-thin scrollbar-track-muted/5 scrollbar-thumb-muted/20 relative h-48 overflow-y-auto rounded-lg bg-muted p-3 text-sm backdrop-blur-sm"
              >
                <div
                  className={`text-primary-foreground/50 absolute bottom-2 right-2 z-10 ${
                    !showScrollIndicator && "hidden"
                  }`}
                >
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                </div>
                <table className="hidden w-full md:table">
                  <thead className="sticky top-0 bg-highlight-disabled text-left">
                    <tr>
                      <th className="p-2 first:rounded-tl-md">Status</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2 last:rounded-tr-md">Last updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRsvps.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-primary-foreground/60 p-8 text-center"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filteredRsvps.map((rsvp, index) => (
                        <tr key={index} className="border-t border-white/10">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {rsvpTypeToEmoji(rsvp.rsvpType)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
                                    disabled={isUpdatingRsvp === rsvp.id}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRsvpStatus(
                                        rsvp.id,
                                        rsvp.attendee.id,
                                        "GOING"
                                      )
                                    }
                                    disabled={
                                      rsvp.rsvpType === "GOING" ||
                                      isUpdatingRsvp === rsvp.id
                                    }
                                  >
                                    Set to Going
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRsvpStatus(
                                        rsvp.id,
                                        rsvp.attendee.id,
                                        "MAYBE"
                                      )
                                    }
                                    disabled={
                                      rsvp.rsvpType === "MAYBE" ||
                                      isUpdatingRsvp === rsvp.id
                                    }
                                  >
                                    Set to Maybe
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRsvpStatus(
                                        rsvp.id,
                                        rsvp.attendee.id,
                                        "NOT_GOING"
                                      )
                                    }
                                    disabled={
                                      rsvp.rsvpType === "NOT_GOING" ||
                                      isUpdatingRsvp === rsvp.id
                                    }
                                  >
                                    Set to Not Going
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                          <td className="p-2">{rsvp.attendee.nickname}</td>
                          <td className="p-2 font-mono text-xs">
                            {rsvp.attendee.email}
                          </td>
                          <td className="p-2 font-mono text-xs">
                            {new Date(rsvp.updatedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="space-y-3 md:hidden">
                  {filteredRsvps.length === 0 ? (
                    <div className="text-primary-foreground/60 py-8 text-center">
                      No records found
                    </div>
                  ) : (
                    filteredRsvps.map((rsvp, index) => (
                      <div
                        key={index}
                        className="space-y-2 rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{rsvpTypeToEmoji(rsvp.rsvpType)}</span>
                            <span className="font-medium">
                              {rsvp.attendee.nickname}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
                                  disabled={isUpdatingRsvp === rsvp.id}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRsvpStatus(
                                      rsvp.id,
                                      rsvp.attendee.id,
                                      "GOING"
                                    )
                                  }
                                  disabled={
                                    rsvp.rsvpType === "GOING" ||
                                    isUpdatingRsvp === rsvp.id
                                  }
                                >
                                  Set to Going
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRsvpStatus(
                                      rsvp.id,
                                      rsvp.attendee.id,
                                      "MAYBE"
                                    )
                                  }
                                  disabled={
                                    rsvp.rsvpType === "MAYBE" ||
                                    isUpdatingRsvp === rsvp.id
                                  }
                                >
                                  Set to Maybe
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateRsvpStatus(
                                      rsvp.id,
                                      rsvp.attendee.id,
                                      "NOT_GOING"
                                    )
                                  }
                                  disabled={
                                    rsvp.rsvpType === "NOT_GOING" ||
                                    isUpdatingRsvp === rsvp.id
                                  }
                                >
                                  Set to Not Going
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <span className="text-primary-foreground/60 text-xs">
                            {new Date(rsvp.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-primary-foreground/60 font-mono text-xs">
                          {rsvp.attendee.email}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div
                className={`absolute bottom-2 right-2 transition-opacity duration-200 ${
                  showScrollIndicator ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="animate-bounce rounded-full bg-highlight-disabled p-1.5">
                  <ChevronDown className="h-4 w-4 text-highlight-foreground" />
                </div>
              </div>
            </div>

            <div className="border-foreground/20 space-y-4 border-t-2 pt-6">
              <h3 className="text-primary-foreground/90 font-secondary text-sm font-semibold">
                Manage Proposers
              </h3>
              <div className="space-y-3 rounded-lg bg-white/10 p-3 text-sm backdrop-blur-sm">
                {event.proposers.map((proposer) => (
                  <div
                    key={proposer.userId}
                    className="rounded bg-muted/30 flex items-center justify-between p-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <UserImage
                          userId={proposer.userId}
                          size="sm"
                          photo={getUserImage(proposer.user)}
                        />
                        <div>
                          <p className="font-medium">
                            {proposer.user.nickname}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {proposer.userId}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveProposer(proposer.userId)}
                      disabled={
                        proposer.userId === fetchedUser?.id ||
                        event.proposers.length <= 1 ||
                        isRemovingProposer === proposer.userId
                      }
                      isLoading={isRemovingProposer === proposer.userId}
                      className="h-auto gap-1 px-2 py-1 text-xs"
                    >
                      <XIcon className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                  <ProposerSearchCombobox
                    selectedUserId={selectedUserId}
                    onSelectUser={(user: DropdownUser | null) => {
                      setSelectedUserId(user?.id ?? null);
                    }}
                    existingProposerIds={existingProposerIds}
                    disabled={isAddingProposer || !!isRemovingProposer}
                  />
                  <Button
                    onClick={handleAddProposer}
                    disabled={
                      !selectedUserId ||
                      isAddingProposer ||
                      !!isRemovingProposer
                    }
                    isLoading={isAddingProposer}
                  >
                    Add Proposer
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-foreground/20 space-y-2 border-t-2 pt-6">
              <h3 className="text-primary-foreground/90 font-secondary text-sm font-semibold">
                Additional Metadata
              </h3>
              <div className="rounded-lg bg-white/10 p-3 text-sm backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-primary-foreground/60">Sequence</p>
                    <p>{event.sequence}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60">Is Series</p>
                    <p>{event.series ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Format timezone name with offset for display
const formatTimezoneDisplay = (tzName: string): string => {
  try {
    const now = DateTime.now().setZone(tzName);
    const offset = now.toFormat("ZZZZ");
    return `${tzName.replace("_", " ")} (${offset})`;
  } catch (e) {
    return tzName;
  }
};

// Function to show the event time in the creation timezone
const formatLocalTimeDisplay = (
  dateTimeStr: string,
  creationTimezone?: string | null
): string => {
  try {
    if (!creationTimezone) {
      // If no creation timezone, show time in local timezone
      return new Date(dateTimeStr).toLocaleString();
    }

    // Parse the date with Luxon for better timezone handling
    // Format the date in the creation timezone
    const creationDate = DateTime.fromISO(dateTimeStr, {
      zone: creationTimezone,
    });
    return creationDate.toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");
  } catch (e) {
    // Fallback if conversion fails
    return new Date(dateTimeStr).toLocaleString();
  }
};

// Function to properly convert and display event time in different timezones
const formatTimeInTimezone = (
  utcDateTimeStr: string,
  targetTimezone: string
): string => {
  try {
    // Parse the date in UTC
    const utcDateTime = DateTime.fromISO(utcDateTimeStr, { zone: "utc" });

    // Convert to target timezone
    const localDateTime = utcDateTime.setZone(targetTimezone);

    // Format with full details
    return localDateTime.toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");
  } catch (e) {
    // Fallback if conversion fails
    console.error("Time conversion error:", e);
    return new Date(utcDateTimeStr).toLocaleString();
  }
};

// Helper function to get formatted date or time in user's local timezone
const getFormattedDateOrTime = (
  dateTimeStr: string,
  format: "date" | "time" | "both"
) => {
  const localDateTime = DateTime.fromISO(dateTimeStr, {
    zone: "utc",
  }).toLocal();

  if (format === "date") {
    return localDateTime.toFormat("EEEE, MMMM d, yyyy");
  } else if (format === "time") {
    return localDateTime.toFormat("h:mm a");
  } else {
    return localDateTime.toFormat("EEEE, MMMM d, yyyy 'at' h:mm a");
  }
};

export default Hero;
