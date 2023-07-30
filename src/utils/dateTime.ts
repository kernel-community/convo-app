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
  const zone = DateTime.local().zoneName ?? DateTime.utc().zone;
  const time = DateTime.fromISO(date, { zone });
  const now = DateTime.local();
  return now > time;
};

export const getDateTimeString = (
  date: string, // iso string with offset
  option: "date" | "time"
): string => {
  const zone = DateTime.local().zoneName ?? DateTime.utc().zone;
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
    const { startDateTime } = s;
    const isInPresent = !isPast(startDateTime);

    if (isInPresent) activeSessions.push(s);
    if (!isInPresent) inactiveSessions.push(s);
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

export const getEventStartAndEnd = (
  dateTime: Date,
  duration: number
): { startDateTime: Date; endDateTime: Date } => {
  const startDateTime = new Date(dateTime);
  const endDateTime = new Date(dateTime);
  endDateTime.setHours(startDateTime.getHours() + duration);
  return {
    startDateTime,
    endDateTime,
  };
};
