import { useEffect, useState } from "react";
import type { Session as ClientSession } from "src/types";
import { isPast, getDateTimeString, sortSessions } from "src/utils/dateTime";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import Session from "./Session";
import { Button } from "src/components/ui/button";
import { useUser } from "src/context/UserContext";
import useUpdateRsvp from "src/hooks/useUpdateRsvp";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "../ui/credenza";
import useEventsFromId from "src/hooks/useEventsFromId";
import { ScrollArea } from "src/components/ui/scroll-area";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { DateTime } from "luxon";

export const SessionsWrapper = ({
  sessions,
}: // hostname,
{
  sessions: ClientSession[];
  // hostname: string;
}) => {
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();
  const {
    sessions: sortedSessions,
    active,
    inactiveSessions,
  } = sortSessions(sessions);
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
      eventIds: active
        .filter((event) => event.availableSeats > 0 || event.noLimit)
        .map((a) => a.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);
  const { isLoading, data } = useEventsFromId({
    ids: [cancelRsvpEventId ?? ""],
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const onClickCancel = async () => {
    setIsDeleting(true);
    try {
      await updateRsvp();
    } catch (err) {
      setIsDeleting(false);
      console.error("There was an Error", JSON.stringify(err));
      return;
    }
    setIsDeleting(false);
    setOpenModalFlag(false);
  };

  const { fetch: updateRsvp } = useUpdateRsvp({
    userId: user.id,
    eventId: cancelRsvpEventId,
    toRsvp: false,
  });

  return (
    <>
      {data && data.sessions && data.sessions[0] && (
        <Credenza open={openModalFlag} onOpenChange={setOpenModalFlag}>
          <CredenzaContent>
            <CredenzaHeader>
              <CredenzaTitle>You are going to {data.title}</CredenzaTitle>
              <CredenzaDescription>Your RSVP details</CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody>
              <div className="flex flex-col gap-8">
                <div>
                  Your RSVP is confirmed for the session on
                  <span className="cursor-crosshair rounded-full px-2 py-1 font-bold underline decoration-dashed hover:bg-slate-300">
                    {getDateTimeString(
                      new Date(data.sessions[0].startDateTime).toISOString(),
                      "date"
                    )}
                    ,{" "}
                    {getDateTimeString(
                      new Date(data.sessions[0].startDateTime).toISOString(),
                      "time"
                    )}
                  </span>{" "}
                  happening at
                  <span className="cursor-crosshair rounded-full px-2 py-1 font-bold underline decoration-dashed hover:bg-slate-300">
                    {data.location}.
                  </span>
                </div>
                {/* todo @anggxyz */}
                <div>
                  All RSVPs automatically receive an email with a calendar
                  invite, but if the email couldnt find you, pick the calendar
                  event file you can download from the following{" "}
                  <AddToCalendarButton
                    name={data.title}
                    options={[
                      "Apple",
                      "Google",
                      "iCal",
                      "Yahoo",
                      "Outlook.com",
                      "Microsoft365",
                    ]}
                    location={data.location}
                    description={
                      // data.descriptionHtml
                      //   ? `This event was copied over into your Calendar. Go to ${
                      //       hostname.includes("localhost")
                      //         ? "http://"
                      //         : "https://"
                      //     }${hostname}/rsvp/${
                      //       data.hash
                      //     } for the most recent version\n\n` +
                      //     data.descriptionHtml
                      //   : ""
                      ""
                    }
                    startDate={DateTime.fromISO(
                      new Date(data.sessions[0].startDateTime).toISOString()
                    ).toFormat("yyyy-MM-dd")}
                    endDate={DateTime.fromISO(
                      new Date(data.sessions[0].endDateTime).toISOString()
                    ).toFormat("yyyy-MM-dd")}
                    startTime={DateTime.fromISO(
                      new Date(data.sessions[0].startDateTime).toISOString()
                    ).toFormat("HH:mm")}
                    endTime={DateTime.fromISO(
                      new Date(data.sessions[0].endDateTime).toISOString()
                    ).toFormat("HH:mm")}
                    // fetch zonename from the datetime, if not found, fallback on client's zone
                    timeZone={
                      DateTime.fromISO(
                        new Date(data.sessions[0].endDateTime).toISOString()
                      ).zoneName ??
                      Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                    buttonStyle="round"
                    trigger="click"
                    size="1"
                    hideCheckmark
                    listStyle="overlay"
                    buttonsList
                  />
                  {/* <span className="cursor-pointer rounded-full bg-zinc-600 px-2 py-1 text-white hover:shadow-outline hover:shadow-slate-300">
                    add to calendar
                  </span>{" "} */}
                </div>
                <div>
                  If instead you changed your mind and would like to remove your
                  RSVP from this session click here to{" "}
                  <span
                    className="cursor-pointer rounded-full bg-red-500 px-2 py-1 text-white hover:shadow-outline hover:shadow-slate-300"
                    onClick={() => onClickCancel()}
                  >
                    {isLoading || isDeleting
                      ? "removing RSVP..."
                      : "Remove RSVP"}
                  </span>
                </div>
              </div>
            </CredenzaBody>
            <CredenzaFooter>
              <div className="flex w-full flex-col gap-1">
                <Button onClick={closeModal}>Close</Button>
              </div>
            </CredenzaFooter>
          </CredenzaContent>
        </Credenza>
      )}
      <div className="w-100 [&>*]:my-3">
        {active.map((session, key) => {
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
        {inactiveSessions && inactiveSessions.length > 0 && (
          <>
            <div className="font-primary">Other sessions:</div>
            <ScrollArea className="h-[150px] w-[100%] rounded-md border p-4">
              {inactiveSessions.map((session, key) => {
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
                    isChecked={false}
                    startDateTime={session.startDateTime}
                  />
                );
              })}
            </ScrollArea>
          </>
        )}
        <div className="font-secondary text-sm font-light lowercase">
          in your local timezone&nbsp;
          <span className="font-semibold">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>
      </div>
    </>
  );
};
