import type { Event, Rsvp, User } from "@prisma/client";

export type ServerEvent = Event & {
  proposer: User;
  Rsvp: Array<Rsvp>;
};
export type Session = Pick<ServerEvent, "id" | "limit" | "Rsvp"> & {
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
};
