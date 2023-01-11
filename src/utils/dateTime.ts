import type { ClientInputSession } from "../types";
import { DateTime } from "luxon";

export const sessionDatesValidity = (
  sessions: ClientInputSession[]
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
      return time.toFormat("d LLL");
    case "time":
      return time.toFormat("hh:mm a");
    default:
      return "";
  }
};
