import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { useAccount } from "wagmi";

export type RsvpIntention = {
  eventIds: Array<string>;
  attendeeAddress: string;
  // following two fields are collected at the point of rsvp
  email?: string;
  nickname?: string;
};

export type AttendeeRsvp = {
  rsvpIntention: RsvpIntention;
  setRsvpIntention: ({
    eventIds,
    attendeeAddress,
    email,
    nickname,
  }: RsvpIntention) => void;
};

const defaultAttendeeRsvp: AttendeeRsvp = {
  rsvpIntention: {
    eventIds: [],
    attendeeAddress: "",
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
  const { data: session } = useSession();
  const { address } = useAccount();
  // should probably throw an error if session is undefined
  // on the app we are redirecting to sign in when this happens
  // see /signin
  const [rsvpIntention, setRsvpIntention] = useState<RsvpIntention>({
    attendeeAddress: session?.user.address || address || "",
    eventIds: [],
    email: "",
    nickname: "",
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
