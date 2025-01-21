import type { ClientEvent } from "src/types";
import { DEFAULT_PROFILE_IMAGE } from "src/utils/constants";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
} from "../ui/credenza";
import { useState } from "react";
import { Button } from "../ui/button";
import { useUser } from "src/context/UserContext";

export default function ViewOtherRSVPs({ event }: { event: ClientEvent }) {
  const [open, setOpen] = useState<boolean>(false);
  const { fetchedUser } = useUser();
  return (
    <>
      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaContent className="flex h-[34rem] flex-col">
          <CredenzaHeader>All other RSVPs</CredenzaHeader>
          <CredenzaBody className="flex-1 overflow-y-auto">
            {event.uniqueRsvps.map((rsvp, key) => {
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
                </div>
              );
            })}
          </CredenzaBody>
          <CredenzaFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
      <div
        className="flex cursor-pointer -space-x-4 rtl:space-x-reverse"
        onClick={() => setOpen(true)}
      >
        {event.uniqueRsvps.slice(0, 3).map((rsvp, key) => {
          const photo = rsvp.attendee?.profile?.photo || DEFAULT_PROFILE_IMAGE;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
              src={photo}
              alt=""
              key={key}
            />
          );
        })}
        {event.uniqueRsvps.length - 3 > 0 && (
          <a
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800"
            href="#"
          >
            +{event.uniqueRsvps.length - 3}
          </a>
        )}
      </div>
    </>
  );
}
