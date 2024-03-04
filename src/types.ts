import type {
  Collection,
  Community,
  Event,
  Google,
  Rsvp,
  Slack,
  User,
} from "@prisma/client";

export type ServerEvent = Event & {
  proposer: User;
  rsvps: Array<
    Rsvp & {
      attendee: User;
    }
  >;
  collections: Array<Collection>;
  community:
    | (Community & {
        google: Google | null;
        slack: Slack | null;
      })
    | null;
};
export type Session = Pick<ServerEvent, "id" | "limit" | "rsvps"> & {
  rsvpCount: number;
  startDateTime: string;
  endDateTime: string;
  availableSeats: number;
  noLimit: boolean;
};

export type ClientEvent = Omit<ServerEvent, "startDateTime" | "endDateTime"> & {
  sessions: Array<Session>;
  totalUniqueRsvps: number;
  startDateTime: string;
  endDateTime: string;
  nickname: string;
};

export type EventsRequest = {
  type:
    | "live"
    | "upcoming"
    | "past"
    | "today"
    | "week"
    | "month"
    | "nextTwentyEightDays"
    | "collection";
  now: Date | string;
  take?: number;
  fromId?: string;
  skip?: number;
  filter?: {
    proposerId?: string;
    rsvpUserId?: string;
    collection?: {
      id: string;
      when: "past" | "upcoming";
    };
  };
};

export type FullCollection = Collection & { user: User; events: Event[] };
