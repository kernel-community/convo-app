import _ from "lodash";
import { E } from "partysocket/use-ws-YFPmbpmh";
import type { ServerEvent } from "src/types";

// no idea what i did here, pls don't ask me

const totalUniqueRSVPsForEvent = (e: ServerEvent[]) =>
  totalUniqueElements(e.map((e) => e.rsvps.map((r) => r.attendeeId))).length;

export const uniqueRSVPs = (e: ServerEvent[]): ServerEvent["rsvps"] => {
  const rsvps = e.map((event) => event.rsvps).flat();
  return _.uniqWith(rsvps, _.isEqual);
};

export const totalUniqueElements = (a: Array<Array<string>>) =>
  a.flat().filter((v, i, s) => s.indexOf(v) === i);

export default totalUniqueRSVPsForEvent;
