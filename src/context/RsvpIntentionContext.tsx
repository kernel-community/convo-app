"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type RsvpIntention = {
  eventIds: Array<string>;
};

export type AttendeeRsvp = {
  rsvpIntention: RsvpIntention;
  setRsvpIntention: ({ eventIds }: RsvpIntention) => void;
};

const defaultAttendeeRsvp: AttendeeRsvp = {
  rsvpIntention: {
    eventIds: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setRsvpIntention: () => {},
};

const RsvpIntentionContext = createContext<AttendeeRsvp>(defaultAttendeeRsvp);

const useRsvpIntention = () => {
  const context = useContext(RsvpIntentionContext);
  if (!context) {
    throw new Error(
      `useRsvpIntention must be used within RsvpIntentionProvider`
    );
  }
  return context;
};

const RsvpIntentionProvider = ({ children }: { children: ReactNode }) => {
  // should probably throw an error if session is undefined
  // on the app we are redirecting to sign in when this happens
  // see /signin
  const [rsvpIntention, setRsvpIntention] = useState<RsvpIntention>({
    eventIds: [],
  });

  const value = useMemo(
    () => ({ rsvpIntention, setRsvpIntention }),
    [rsvpIntention]
  );
  return (
    <RsvpIntentionContext.Provider value={value}>
      {children}
    </RsvpIntentionContext.Provider>
  );
};

export { RsvpIntentionProvider, useRsvpIntention };
