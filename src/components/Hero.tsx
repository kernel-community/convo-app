import type { ClientEvent } from "src/types";
import { InfoBox } from "./InfoBox";
import { useRef } from "react";
import { ChevronDown, MessageCircle, Plus, WrenchIcon } from "lucide-react";
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
import { UserImage } from "src/components/ui/default-user-image";
import { EventCard, EventsView } from "./ui/event-list";
import { parseConvoLocation } from "src/utils/parseConvoLocation";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import type { User } from "@prisma/client";
import { RSVP_TYPE } from "@prisma/client";
import useUpdateRsvp from "src/hooks/useUpdateRsvp";
import useUserRsvpForConvo from "src/hooks/useUserRsvpForConvo";
import Signature from "./EventPage/Signature";
import FieldLabel from "./EventPage/RsvpConfirmationForm/FieldLabel";
import LoginButton from "./LoginButton";
import { rsvpTypeToEmoji } from "src/utils/rsvpTypeToEmoji";
import { cleanupRruleString } from "src/utils/cleanupRruleString";
import { rrulestr } from "rrule";
import { ArrowUpRight } from "lucide-react";
const When = ({
  event,
  className,
}: {
  event: ClientEvent;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
          <CardDescription>
            <span className="text-xs text-foreground">
              timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {getDateTimeString(event.startDateTime, "date")}
            {", "}
            {getDateTimeString(event.startDateTime, "time")}
          </div>
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
          {(isUserGoing || isOwnerOfConvo) && event.location
            ? (() => {
                try {
                  new URL(event.location); // If this succeeds, it's a valid URL
                  return (
                    <a
                      href={event.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {event.location.length > 100
                        ? event.location.substring(0, 100) + "..."
                        : event.location}
                    </a>
                  );
                } catch {
                  return event.location.length > 100
                    ? event.location.substring(0, 100) + "..."
                    : event.location;
                }
              })()
            : null}

          {!(isUserGoing || isOwnerOfConvo) && (
            <span className="text-sm text-gray-500">RSVP to see location</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
  const [open, setOpen] = useState<boolean>(false);
  const { fetchedUser } = useUser();
  if (!isUserGoing && !isOwnerOfConvo) return null;
  if (!fetchedUser?.isSignedIn) return null;
  const filteredRsvps = event.uniqueRsvps.filter(
    (rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING
  );
  const hasRsvps = filteredRsvps.length > 0;
  return (
    <>
      {noModal ? null : (
        <Credenza open={open} onOpenChange={setOpen}>
          <CredenzaContent className="flex h-[34rem] flex-col">
            <CredenzaHeader>All other RSVPs</CredenzaHeader>
            <CredenzaBody className="flex-1 overflow-y-auto">
              {filteredRsvps.map((rsvp, key) => {
                return (
                  <div
                    key={key}
                    className="my-2 flex flex-row items-center gap-3"
                  >
                    <UserImage
                      photo={rsvp.attendee?.profile?.photo}
                      size="md"
                      userId={rsvp.attendee.id}
                    />
                    {fetchedUser.id === rsvp.attendee.id ? (
                      <span>
                        <span className="font-bold">You</span>
                        <span> ({rsvp.attendee.nickname})</span>
                      </span>
                    ) : (
                      <span>{rsvp.attendee.nickname}</span>
                    )}
                    <span>{rsvpTypeToEmoji(rsvp.rsvpType)}</span>
                  </div>
                );
              })}
            </CredenzaBody>
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
            <ViewOtherRSVPs event={event} />
          ) : (
            <div className="text-sm text-gray-500">No RSVPs yet</div>
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
      {isSignedIn ? `When you RSVP as "Maybe" a seat is reserved` : ""}
    </div>
  );
};

const RSVP = ({
  event,
  className,
  totalAvailableSeats,
  totalSeats,
  isOwnerOfConvo,
}: {
  event: ClientEvent;
  className?: string;
  totalAvailableSeats: number;
  totalSeats: number;
  isOwnerOfConvo: boolean;
}) => {
  const { rsvp } = useUserRsvpForConvo({ hash: event.hash });
  const { fetchedUser: user } = useUser();
  const [rsvpType, setRsvpType] = useState<RSVP_TYPE>(RSVP_TYPE.GOING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchedUser } = useUser();
  const { fetch: updateRsvp } = useUpdateRsvp({
    eventId: event.id,
    userId: fetchedUser?.id,
    type: rsvpType,
  });
  const onRsvpTypeChange = (rsvpType: RSVP_TYPE) => {
    setRsvpType(rsvpType);
  };
  useEffect(() => {
    setRsvpType(rsvp ? rsvp.rsvpType : RSVP_TYPE.GOING);
  }, [rsvp]);
  const submit = async () => {
    try {
      setIsSubmitting(true);
      await updateRsvp();
    } catch (error) {
      console.error("Failed to update RSVP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getCurrentRsvpTypeToString = () => {
    return rsvp?.rsvpType ? (
      RSVP_TYPE_MESSAGES[rsvp.rsvpType]
    ) : (
      <>
        You have not{" "}
        <span className="underline decoration-dotted underline-offset-4">
          RSVPed
        </span>{" "}
        yet
      </>
    );
  };
  if (isOwnerOfConvo) {
    return null;
  }
  if (!fetchedUser?.isSignedIn) {
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
        <CardDescription>
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
        <RadioGroup className="flex flex-col gap-6 text-gray-500 sm:flex-row">
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
        {user.isSignedIn && (
          <div className="mt-6">
            <FieldLabel>Signing as</FieldLabel>
            <div className="flex flex-row gap-3">
              <Signature user={user as User} style="fancy" />
            </div>
          </div>
        )}
        <Button
          onClick={submit}
          className="mt-4 w-full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {rsvp ? "Update RSVP" : "RSVP"}
        </Button>
      </CardContent>
    </Card>
  );
};

const Hero = ({
  isImported,
  isDeleted,
  event,
}: {
  isImported?: boolean;
  isDeleted?: boolean;
  event: ClientEvent;
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
  const isOwnerOfConvo = fetchedUser?.id === event.proposerId;
  const isKernelCommunityMember = fetchedUser?.isKernelCommunityMember;
  const { rsvp: userRsvp } = useUserRsvpForConvo({ hash: event.hash });
  const isUserGoing =
    userRsvp?.rsvpType === RSVP_TYPE.GOING ||
    userRsvp?.rsvpType === RSVP_TYPE.MAYBE;
  const totalAvailableSeats =
    event.limit -
    event.rsvps.filter((rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING).length;
  const totalSeats = event.limit;
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

      {(isKernelCommunityMember || isOwnerOfConvo) && (
        <motion.div
          className="my-4 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AdminMetricsAccordion event={event} />
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

  const filteredRsvps = event.rsvps.filter((rsvp) =>
    rsvpFilter === "all" ? true : rsvp.rsvpType === rsvpFilter
  );

  useEffect(() => {
    // Reset message input if there are no RSVPs after filtering
    if (filteredRsvps.length === 0) {
      setShowMessageInput(false);
      setMessage("");
    }
  }, [filteredRsvps.length]);

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

    // Re-check when content changes
    const observer = new ResizeObserver(checkScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [isOpen, rsvpFilter]);
  const { fetchedUser } = useUser();
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
            {/* RSVP Stats */}
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
                <div className="flex items-center gap-4">
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
                    <div className="relative">
                      <button
                        onClick={() => setShowMessageInput(!showMessageInput)}
                        className="bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-primary-foreground transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message?
                      </button>
                      <MessageCredenza
                        isOpen={showMessageConfirm}
                        onClose={() => setShowMessageConfirm(false)}
                        recipients={filteredRsvps}
                        message={message}
                        isLoading={isSending}
                        onSend={async () => {
                          try {
                            setIsSending(true);
                            const response = await fetch("/api/send-message", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                recipients:
                                  fetchedUser &&
                                  !filteredRsvps.some(
                                    (rsvp) =>
                                      rsvp.attendee.id === fetchedUser.id
                                  )
                                    ? [
                                        ...filteredRsvps,
                                        { attendee: fetchedUser },
                                      ]
                                    : filteredRsvps,
                                event,
                                message,
                              }),
                            });

                            if (!response.ok) {
                              throw new Error("Failed to send messages");
                            }

                            setShowMessageConfirm(false);
                            setShowMessageInput(false);
                            setMessage("");
                          } catch (error) {
                            console.error("Error sending messages:", error);
                          } finally {
                            setIsSending(false);
                          }
                        }}
                      />
                      <AnimatePresence></AnimatePresence>
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
                      window.location.reload();
                    }}
                  />
                </div>
              </div>
              {/* Message input section with animation */}
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
                {/* Scroll indicator */}
                <div
                  className={`text-primary-foreground/50 absolute bottom-2 right-2 z-10 ${
                    !showScrollIndicator && "hidden"
                  }`}
                >
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                </div>
                {/* Table view (desktop) */}
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
                            {rsvpTypeToEmoji(rsvp.rsvpType)}
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
                    )}{" "}
                  </tbody>
                </table>

                {/* Card view (mobile) */}
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
              {/* Scroll indicator */}
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

            {/* Proposer Info */}
            <div className="border-foreground/20 space-y-2 border-t-2 pt-6">
              <h3 className="text-primary-foreground/90 font-secondary text-sm font-semibold">
                Proposer Information
              </h3>
              <div className="rounded-lg bg-white/10 p-3 text-sm backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-primary-foreground/60">Proposer ID</p>
                    <p className="font-mono">{event.proposerId}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60">Nickname</p>
                    <p>{event.proposer.nickname}</p>
                  </div>
                  <div>
                    <p className="text-primary-foreground/60">Email</p>
                    <p>{event.proposer.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metadata */}
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

export default Hero;
