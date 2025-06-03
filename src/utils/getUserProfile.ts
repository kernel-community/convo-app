import type { Profile } from "@prisma/client";

/**
 * Helper function to extract user profile from either profiles array or legacy profile field
 * This provides backward compatibility as we transition to community-specific profiles
 */
export function getUserProfile(user: {
  profiles?: Profile[];
  profile?: Profile | null;
}): Profile | null {
  // If profiles array exists and has items, use the first one (community-specific)
  if (
    user.profiles &&
    Array.isArray(user.profiles) &&
    user.profiles.length > 0
  ) {
    return user.profiles[0]!;
  }

  // Fallback to legacy profile field
  return user.profile || null;
}

/**
 * Helper function to get user image from either profiles array or legacy profile field
 */
export function getUserImage(user: {
  profiles?: Profile[];
  profile?: Profile | null;
}): string | null {
  const profile = getUserProfile(user);
  return profile?.image || null;
}

/**
 * Helper function to get user bio from either profiles array or legacy profile field
 */
export function getUserBio(user: {
  profiles?: Profile[];
  profile?: Profile | null;
}): string | null {
  const profile = getUserProfile(user);
  return profile?.bio || null;
}

/**
 * Helper function to get user current affiliation from either profiles array or legacy profile field
 */
export function getUserAffiliation(user: {
  profiles?: Profile[];
  profile?: Profile | null;
}): string | null {
  const profile = getUserProfile(user);
  return profile?.currentAffiliation || null;
}
