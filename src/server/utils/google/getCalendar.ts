import { getAuth } from "./auth";
import { google } from "googleapis";

export const getCalendar = async ({ communityId }: { communityId: string }) => {
  let auth;
  try {
    auth = await getAuth({ communityId });
  } catch (e) {
    throw e;
  }
  const calendar = google.calendar({ version: "v3", auth });
  return calendar;
};
