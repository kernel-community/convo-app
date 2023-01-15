import type { ClientEvent, Session } from "../types";
import { DateTime } from "luxon";

export const sessionDatesValidity = (
  sessions: Array<Pick<ClientEvent, "startDateTime" | "endDateTime">>
): boolean => {
  let validity = true;
  sessions.forEach((session) => {
    const dt = DateTime.fromISO(session.startDateTime ?? "");
    const isPast: boolean = DateTime.local() >= dt;
    validity = validity && dt.isValid && !isPast;
  });
  return validity;
};

export const isPast = (date: string): boolean => {
  const zone = DateTime.local().zoneName;
  const time = DateTime.fromISO(date, { zone });
  const now = DateTime.local();
  return now > time;
};

export const getDateTimeString = (
  date: string, // iso string with offset
  option: "date" | "time"
): string => {
  const zone = DateTime.local().zoneName;
  const time = DateTime.fromISO(date, { zone });
  switch (option) {
    case "date":
      return time.toFormat("d LLL yyyy");
    case "time":
      return time.toFormat("hh:mm a");
    default:
      return "";
  }
};

export const sortSessions = (sessions: Session[]) => {
  const activeSessions: Session[] = [];
  const inactiveSessions: Session[] = [];
  sessions.forEach((s) => {
    const { startDateTime, noLimit, availableSeats } = s;
    const active =
      (noLimit && !isPast(startDateTime)) ||
      (availableSeats > 0 && !isPast(startDateTime));

    if (active) activeSessions.push(s);
    if (!active) inactiveSessions.push(s);
  });
  activeSessions.sort(
    (s1, s2) =>
      new Date(s1.startDateTime).getTime() -
      new Date(s2.startDateTime).getTime()
  );
  inactiveSessions.sort(
    (s1, s2) =>
      new Date(s1.startDateTime).getTime() -
      new Date(s2.startDateTime).getTime()
  );
  return {
    sessions: [...activeSessions, ...inactiveSessions],
    active: activeSessions,
    inactiveSessions: inactiveSessions,
  };
};
