import { useEffect, useState } from "react";
import type { Session as ClientSession } from "src/types";
import { isPast, getDateTimeString, sortSessions } from "src/utils/dateTime";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import Session from "./Session";
import ConfirmationModal from "../ConfirmationModal";
import Button from "../Button";
import { useUser } from "src/context/UserContext";
import useUpdateRsvp from "src/hooks/useUpdateRsvp";
import isNicknameSet from "src/utils/isNicknameSet";
import formatUserIdentity from "src/utils/formatUserIdentity";

const RemoveRSVPModal = ({
  address,
  eventId,
}: {
  address: string | null | undefined;
  eventId: string | null | undefined;
}) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const onClickCancel = async () => {
    try {
      await updateRsvp();
    } catch (err) {
      console.error("There was an Error", JSON.stringify(err));
      setIsError(true);
      setIsSuccess(false);
      return;
    }
    setIsError(false);
    setIsSuccess(true);
  };
  const { fetch: updateRsvp } = useUpdateRsvp({
    address,
    eventId,
    toRsvp: false,
  });

  if (!address || !eventId) {
    console.log("there was an error", JSON.stringify({ address, eventId }));
    return <div>There was an error; Try again?</div>;
  }

  if (isSuccess) {
    return <div>Cancelled RSVP</div>;
  }

  if (isError) {
    return <div>There was an Error :(</div>;
  }

  return <Button buttonText="Cancel RSVP?" handleClick={onClickCancel} />;
};

export const SessionsWrapper = ({
  sessions,
}: {
  sessions: ClientSession[];
}) => {
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();
  const { sessions: sortedSessions, active } = sortSessions(sessions);
  const { fetchedUser: user } = useUser();
  const [openModalFlag, setOpenModalFlag] = useState(false);
  const [cancelRsvpEventId, setCancelRsvpEventId] = useState<
    string | undefined
  >(undefined);
  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);
  const handleSessionSelect = (
    id: string,
    checked: boolean,
    isEdit: boolean
  ) => {
    if (isEdit) {
      // open modal to handle rsvp edit
      setCancelRsvpEventId(() => id);
      openModal();
    }
    switch (checked) {
      case true:
        setRsvpIntention({
          ...rsvpIntention,
          eventIds: [...rsvpIntention.eventIds, id],
        });
        break;
      case false:
        setRsvpIntention({
          ...rsvpIntention,
          eventIds: rsvpIntention.eventIds.filter((r) => r !== id),
        });
        break;
      default: {
        throw new Error(`unknown value for checked: ${checked}`);
      }
    }
  };
  useEffect(() => {
    setRsvpIntention({
      ...rsvpIntention,
      eventIds: active.map((a) => a.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);
  const TransitioningArrow = () => {
    return (
      <span className="transition group-open:rotate-180">
        <svg
          fill="none"
          height="24"
          shape-rendering="geometricPrecision"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </span>
    );
  };
  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={
          <RemoveRSVPModal address={user.address} eventId={cancelRsvpEventId} />
        }
        title="Edit your RSVP"
      />
      <div className="w-100 [&>*]:my-3">
        {sortedSessions.map((session, key) => {
          const active =
            (session.noLimit && !isPast(session.startDateTime)) ||
            (session.availableSeats > 0 && !isPast(session.startDateTime));
          return (
            <Session
              handleClick={handleSessionSelect}
              key={key}
              data={session.id}
              date={getDateTimeString(session.startDateTime, "date")}
              time={getDateTimeString(session.startDateTime, "time")}
              availableSeats={session.availableSeats}
              totalSeats={session.limit}
              noLimit={session.noLimit}
              isChecked={active}
              startDateTime={session.startDateTime}
            />
          );
        })}
        <div className="font-secondary text-sm font-light lowercase">
          in your local timezone&nbsp;
          <span className="font-semibold">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
        {sortedSessions.map((session, key) => {
          const userRsvp = session.rsvps.some(
            (rsvp) => rsvp.attendeeId === user.id
          );
          return (
            <>
              {userRsvp && (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    See All Rsvps list <TransitioningArrow />
                  </summary>
                  <div className="group-open:animate-fadeIn mt-3 overflow-y-auto text-neutral-600">
                    {session.rsvps.map((rsvp: any, key: any) => {
                      if (isNicknameSet(rsvp.attendee.nickname)) {
                        return (
                          <div key={key}>
                            {formatUserIdentity(rsvp.attendee.nickname)}
                          </div>
                        );
                      }
                    })}
                  </div>
                </details>
              )}
            </>
          );
        })}
      </div>
    </>
  );
};
