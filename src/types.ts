import { z } from "zod";

import type {
  Collection,
  Community,
  Event,
  Profile,
  Rsvp,
  Slack,
  User,
  EventProposer,
  RsvpApprovalRequest,
  RSVP_TYPE,
  RSVP_APPROVAL_STATUS,
} from "@prisma/client";
import { DateTime } from "luxon";

export type ServerEvent = Event & {
  proposers: (EventProposer & {
    user: User & { profiles?: Profile[]; profile?: Profile | null };
  })[];
  rsvps: Array<
    Rsvp & {
      attendee: User & {
        profiles?: Profile[];
        profile?: Profile | null;
      };
    }
  >;
  collections: Array<Collection>;
  community:
    | (Community & {
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
  sessions: Array<Session>; // @note deprecated; array of 1 session since rrule introduction; don't use this; use dateTimeStartAndEnd and recurrenceRule instead
  totalUniqueRsvps: number;
  startDateTime: string;
  endDateTime: string;
  proposers: Array<
    EventProposer & {
      user: User & { profiles?: Profile[]; profile?: Profile | null };
    }
  >;
  uniqueRsvps: ServerEvent["rsvps"];
  recurrenceRule: string;
  waitlistCount: number;
  isCurrentUserWaitlisted: boolean;
  // Added to indicate if current user has admin privileges for this event
  isProposer?: boolean;
  // Approval-related fields
  requiresApproval: boolean;
  approvalRequestsCount?: number;
  userApprovalRequest?: RsvpApprovalRequestWithDetails;
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
    userId?: string; // For combined filter that includes both proposed and RSVP'd events
    nickname?: string; // For displaying the user's nickname in the UI
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

export const clientEventInputValidationScheme = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dateTimeStartAndEnd: z.object({
    start: z.date().default(DateTime.now().toJSDate()),
    end: z.date().default(DateTime.now().plus({ minutes: 30 }).toJSDate()),
  }),
  recurrenceRule: z.string().optional(),
  sessions: z.array(SessionSchema),
  limit: z
    .string()
    .refine((val) => !Number.isNaN(parseInt(val, 10)), {
      message: "Please enter a number",
    })
    .refine((val) => Number(parseInt(val, 10)) >= 0, {
      message: "Please enter a positive integer",
    }),
  location: z.string().min(1, "Location is required"),
  nickname: z.string().optional(),
  gCalEvent: z.boolean().default(true),
  hash: z.string().optional(),
  email: z.string().optional(),
  id: z.string().optional(),
  type: z.enum(["JUNTO", "UNLISTED", "INTERVIEW", "TEST"]).default("JUNTO"),
  creationTimezone: z.string().optional(),
  proposers: z.array(z.object({ userId: z.string() })).optional(),
  requiresApproval: z.boolean().optional(),
});

export type ClientEventInput = z.infer<typeof clientEventInputValidationScheme>;

export type RsvpApprovalRequestWithDetails = RsvpApprovalRequest & {
  user: User & { profiles?: Profile[]; profile?: Profile | null };
  reviewer?: {
    id: string;
    nickname: string;
  };
};

export type FullEvent = Event & {
  proposers: (EventProposer & { user: User })[];
  community: Community & {
    slack: Slack;
  };
};
