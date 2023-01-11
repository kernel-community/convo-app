import type { ServerEvent } from "src/types";

// no idea what i did here, pls don't ask me

const totalUniqueRSVPsForEvent = (e: ServerEvent[]) =>
  totalUniqueElements(e.map((e) => e.Rsvp.map((r) => r.attendeeId)));

export const totalUniqueElements = (a: Array<Array<string>>) =>
  a.flat().filter((v, i, s) => s.indexOf(v) === i).length;

export default totalUniqueRSVPsForEvent;
