import { getAuth } from "./auth";
import { google } from "googleapis";

export const getCalendar = async () => {
  let auth;
  try {
    auth = await getAuth();
  } catch (e) {
    throw new Error("error in auth");
  }
  const calendar = google.calendar({ version: "v3", auth });
  return calendar;
};
