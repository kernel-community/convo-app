import { RSVP_TYPE } from "@prisma/client";
import type { ClientEvent, EventsRequest, ServerEvent } from "src/types";
import totalUniqueRSVPs, { uniqueRSVPs } from "src/utils/totalUniqueRsvps";

// Define an extended ServerEvent type that includes the waitlist and approval request fields
// We expect the caller (getEventByHash) to provide these based on its Prisma query
type ServerEventWithWaitlist = ServerEvent & {
  _count?: {
    waitlist: number;
    approvalRequests: number;
  };
  waitlist?: { userId: string }[]; // Expecting an array with 0 or 1 entry for the specific user
  approvalRequests?: Array<{
    id: string;
    status: string;
    message?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewMessage?: string;
    user: {
      id: string;
      nickname: string;
      profile?: {
        image?: string;
      } | null;
    };
    reviewer?: {
      id: string;
      nickname: string;
    } | null;
  }>; // Expecting an array with 0 or 1 entry for the specific user
};

// Update the function signature to accept ServerEventWithWaitlist[] and optional userId
const formatEvent = (
  event: Array<ServerEventWithWaitlist>,
  userId?: string | null
): ClientEvent => {
  if (event.length === 0 || !event) {
    throw new Error("[utils/formatEvent] input event array empty");
  }
  const firstInSeries = event[0];
  if (!firstInSeries) {
    throw new Error("firstInSeries undefined");
  }
  const { startDateTime, endDateTime, proposers } = firstInSeries;

  // Extract waitlist info from the first event (should be consistent across series)
  const waitlistCount = firstInSeries._count?.waitlist ?? 0;
  // Check if the waitlist array included for the user has an entry
  const isCurrentUserWaitlisted = firstInSeries.waitlist
    ? firstInSeries.waitlist.length > 0
    : false;

  // Extract approval request info for the user
  const approvalRequestsCount = firstInSeries._count?.approvalRequests ?? 0;
  const userApprovalRequest = firstInSeries.approvalRequests
    ? firstInSeries.approvalRequests[0] || undefined
    : undefined;

  return {
    ...firstInSeries,
    id: firstInSeries.id,
    community: firstInSeries.community, // Include the community data from the event
    recurrenceRule: firstInSeries.rrule || "",
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    totalUniqueRsvps: totalUniqueRSVPs(event),
    uniqueRsvps: uniqueRSVPs(event),
    proposers: firstInSeries.proposers.map((p) => ({
      ...p,
      user: {
        ...p.user,
        profile: p.user.profile ?? null,
      },
    })),
    sessions: event.map((e) => {
      const { id, startDateTime, endDateTime, limit, rsvps } = e;
      // Calculate GOING count specifically for availableSeats logic
      const goingCount = rsvps.filter(
        (r) => r.rsvpType === RSVP_TYPE.GOING
      ).length;
      return {
        id,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        limit,
        rsvps,
        rsvpCount: rsvps.length,
        // Correct available seats calculation based on GOING count
        availableSeats: limit > 0 ? Math.max(0, limit - goingCount) : Infinity,
        noLimit: limit === 0,
      };
    }),
    // Add the new waitlist fields
    waitlistCount: waitlistCount,
    isCurrentUserWaitlisted: !!userId && isCurrentUserWaitlisted, // Ensure only true if userId was provided
    // Add approval-related fields
    approvalRequestsCount: approvalRequestsCount,
    userApprovalRequest: userApprovalRequest as any,
  };
};

// Update formatEvents to accept the extended type and pass userId
export const formatEvents = (
  events: Array<ServerEventWithWaitlist>,
  filter?: EventsRequest["filter"],
  userId?: string | null
): Array<ClientEvent> => {
  // Pass userId to the formatEvent call within the map
  let res = events.map((event) => formatEvent([event], userId));
  if (filter) {
    if (filter.proposerId) {
      // filter by userId
      res = res.filter((event) =>
        event.proposers.some((p) => p.userId === filter.proposerId)
      );
    }
    if (filter.rsvpUserId) {
      const rsvpId: string = filter.rsvpUserId;
      res = res.filter((event) => {
        return event.rsvps.map((r) => r.attendeeId).includes(rsvpId);
      });
    }
  }
  return res;
};

export default formatEvent;
