import { z } from "zod";

import type {
  Collection,
  Community,
  Event,
  Google,
  Profile,
  Rsvp,
  Slack,
  User,
} from "@prisma/client";

export type ServerEvent = Event & {
  proposer: User;
  rsvps: Array<
    Rsvp & {
      attendee: User & {
        profile: Profile | null;
      };
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
  uniqueRsvps: ServerEvent["rsvps"];
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

export const botInputSchema = z.object({
  botToken: z.string().min(1),
  channelId: z.string().min(1),
});
export type BotInput = z.infer<typeof botInputSchema>;

export const SessionSchema = z.object({
  dateTime: z.date(),
  duration: z.number().min(0.1, "Invalid duration"),
  count: z.number(),
  id: z.string().optional(),
});

export type SessionSchemaType = z.infer<typeof SessionSchema>;
