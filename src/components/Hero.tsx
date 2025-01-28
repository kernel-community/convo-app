import type { ClientEvent } from "src/types";
import { InfoBox } from "./InfoBox";
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
import { DEFAULT_PROFILE_IMAGE } from "src/utils/constants";
import { EventCard, EventsView } from "./ui/event-list";
import CopyButton from "./CopyButton";
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
          "cursor-pointer transition-shadow duration-300 hover:shadow-lg",
          className
        )}
        onClick={() => (event.recurrenceRule ? setIsOpen(!isOpen) : null)}
      >
        <CardHeader>
          <CardTitle className="text-base">when</CardTitle>
          <CardDescription>
            <span className="text-xs text-gray-500">
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
        "cursor-pointer transition-shadow  duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-base">where</CardTitle>
        {!isUserGoing && (
          <CardDescription>
            <span className="text-xs text-gray-500">RSVP to see location</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-slate-400/10 px-2 py-1 text-sm text-gray-500 transition-all duration-300 hover:bg-slate-400/20">
          {(isUserGoing || isOwnerOfConvo) && event.location
            ? event.location.length > 20
              ? event.location.substring(0, 20) + "..."
              : event.location
            : null}
          {!(isUserGoing || isOwnerOfConvo) && (
            <span className="font-mono text-sm text-gray-500">
              somewhere{" "}
              <span className="italic">
                {" "}
                {parseConvoLocation(event.locationType)}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const WhoElseIsGoing = ({
  event,
  isUserGoing,
  isOwnerOfConvo,
  className,
  totalAvailableSeats,
  totalSeats,
}: {
  event: ClientEvent;
  isUserGoing: boolean;
  isOwnerOfConvo: boolean;
  className?: string;
  totalAvailableSeats: number;
  totalSeats: number;
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
      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaContent className="flex h-[34rem] flex-col">
          <CredenzaHeader>All other RSVPs</CredenzaHeader>
          <CredenzaBody className="flex-1 overflow-y-auto">
            {isOwnerOfConvo && (
              <CopyButton
                text={event.rsvps.map((rsvp) => rsvp.attendee.email).toString()}
                label="Copy all emails"
                className="mb-4"
              />
            )}
            {filteredRsvps.map((rsvp, key) => {
              const photo =
                rsvp.attendee?.profile?.photo || DEFAULT_PROFILE_IMAGE;
              return (
                <div key={key} className="flex flex-row items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                    src={photo}
                    alt=""
                    key={key}
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
      <Card
        onClick={() => (hasRsvps ? setOpen(!open) : null)}
        className={cn(
          "cursor-pointer transition-shadow  duration-300 hover:shadow-lg",
          className
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">who else is going</CardTitle>
          <CardDescription>
            {totalAvailableSeats} of {totalSeats} seats available
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
  [RSVP_TYPE.GOING]: "You are currently marked as Going",
  [RSVP_TYPE.MAYBE]: "You are currently marked as Maybe",
  [RSVP_TYPE.NOT_GOING]: "You are currently marked as Not Going",
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
    return rsvp?.rsvpType
      ? RSVP_TYPE_MESSAGES[rsvp.rsvpType]
      : "You have not RSVPed yet";
  };
  if (isOwnerOfConvo) {
    return null;
  }
  if (!fetchedUser?.isSignedIn) {
    return (
      <Card
        className={cn(
          "cursor-pointer border-kernel-light transition-shadow duration-300 hover:shadow-lg",
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
        "cursor-pointer border-kernel-light transition-shadow duration-300 hover:shadow-lg",
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
        <RadioGroup className="flex flex-row gap-6 text-gray-500">
          <div
            className={cn(
              "flex cursor-pointer flex-row items-center gap-2",
              rsvp?.rsvpType === RSVP_TYPE.GOING &&
                "rounded-full bg-slate-200 px-4 py-2"
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
              "flex cursor-pointer flex-row items-center gap-2",
              rsvp?.rsvpType === RSVP_TYPE.MAYBE &&
                "rounded-full bg-slate-200 px-4 py-2"
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
              "flex cursor-pointer flex-row items-center gap-2",
              rsvp?.rsvpType === RSVP_TYPE.NOT_GOING &&
                "rounded-full bg-slate-200 px-4 py-2"
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
              <Signature user={user as User} style="handwritten" />
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
      <span className="text-kernel-light underline decoration-dotted">
        {c.name}
      </span>
      {k + 1 !== event.collections.length ? "," : ""}
    </Link>
  ));

  const { fetchedUser } = useUser();
  const isOwnerOfConvo = fetchedUser
    ? fetchedUser.id === event.proposerId
    : false;
  const { rsvp: userRsvp } = useUserRsvpForConvo({ hash: event.hash });
  const isUserGoing =
    userRsvp?.rsvpType === RSVP_TYPE.GOING ||
    userRsvp?.rsvpType === RSVP_TYPE.MAYBE;
  const totalAvailableSeats =
    event.limit -
    event.rsvps.filter((rsvp) => rsvp.rsvpType !== RSVP_TYPE.NOT_GOING).length;
  const totalSeats = event.limit;
  return (
    <div className="flex flex-col justify-items-start">
      <div
        className="
          pb-0
          font-heading
          text-3xl
          font-bold
          text-primary
          lg:text-4xl
          xl:text-5xl
        "
      >
        {event?.title}
      </div>
      {isOwnerOfConvo && (
        <div className="text-base italic text-gray-500">You own this convo</div>
      )}

      {isPartOfCollection && (
        <div className="my-4 font-primary text-gray-500">
          {`This event is part of ${
            event.collections.length > 1 ? "" : "the "
          } collection${event.collections.length > 1 ? "s" : ""}:`}
          {collectionHrefs}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-3">
        <When event={event} />
        <Where
          event={event}
          isUserGoing={isUserGoing}
          isOwnerOfConvo={isOwnerOfConvo}
        />
        <WhoElseIsGoing
          event={event}
          isUserGoing={isUserGoing}
          isOwnerOfConvo={isOwnerOfConvo}
          totalAvailableSeats={totalAvailableSeats}
          totalSeats={totalSeats}
        />
        <RSVP
          event={event}
          className="col-span-1 sm:col-span-3 lg:col-span-3"
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

export default Hero;
