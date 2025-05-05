import type { ServerEvent } from "src/types";
import { type Profile, type User } from "@prisma/client";

// We're using type assertions instead of a specific sanitized type
// since we need to maintain compatibility with the original ServerEvent structure

/**
 * Sanitizes event data to remove sensitive attendee information based on user permissions
 *
 * @param event The original event object with all data
 * @param isProposer Whether the current user is a proposer/admin for this event
 * @returns A sanitized version of the event with appropriate access restrictions
 */
export function sanitizeEventData(
  event: ServerEvent | null,
  isProposer: boolean
): ServerEvent | null {
  if (!event) return null;

  // If user is a proposer, they can see all data
  if (isProposer) return event;

  // Clone the event to avoid modifying the original
  const sanitizedEvent = {
    ...event,
    // Sanitize attendee information for non-proposers
    rsvps: event.rsvps.map((rsvp) => ({
      ...rsvp,
      attendee: {
        ...rsvp.attendee, // Start with all properties
        id: rsvp.attendee.id,
        nickname: rsvp.attendee.nickname,
        // Preserve required properties
        address: rsvp.attendee.address,
        isBeta: rsvp.attendee.isBeta,
        // Sanitize sensitive data
        email: null,
        emailVerified: null,
        // Handle profile data
        profile: rsvp.attendee.profile
          ? {
              ...rsvp.attendee.profile, // Keep original structure
              id: rsvp.attendee.profile.id,
              image: rsvp.attendee.profile.image,
              userId: rsvp.attendee.profile.userId,
              createdAt: rsvp.attendee.profile.createdAt,
              updatedAt: rsvp.attendee.profile.updatedAt,
              // Reset sensitive fields
              bio: null,
              email: null,
              phone: null,
              website: null,
              location: null,
              keywords: rsvp.attendee.profile.keywords || [],
              url: null,
              currentAffiliation: null,
            }
          : null,
      } as User & { profile: Profile | null }, // Type assertion to match expected structure
    })),
  } as ServerEvent; // Type assertion to match ServerEvent type

  return sanitizedEvent;
}

export default sanitizeEventData;
