import { prisma } from "src/utils/db";
import { cache } from "react";

export type CommunityFeatureFlag =
  | "slackIntegration"
  | "emailReminders"
  | "waitlist"
  | "rsvpLimits"
  | "recurringEvents"
  | "proposerWorkflow";

/**
 * Gets a feature flag value for a specific community
 * Uses the features field in the Community model
 * @param communityId - The community's database ID
 * @param flagName - The feature flag name to check
 * @param defaultValue - Default value if flag is not defined
 */
export async function getCommunityFeatureFlag(
  communityId: string | undefined | null,
  flagName: CommunityFeatureFlag,
  defaultValue = false
): Promise<boolean> {
  if (!communityId) return defaultValue;

  try {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { features: true },
    });

    if (!community || !community.features) {
      return defaultValue;
    }

    // Parse the features JSON
    const features = community.features as Record<string, unknown>;

    // Check if the feature is explicitly defined
    if (typeof features[flagName] === "boolean") {
      return features[flagName] as boolean;
    }

    return defaultValue;
  } catch (error) {
    console.error(`Error getting feature flag ${flagName}:`, error);
    return defaultValue;
  }
}

/**
 * Cached version of getCommunityFeatureFlag for server components
 */
export const getCommunityFeatureFlagCached = cache(getCommunityFeatureFlag);

/**
 * Get all feature flags for a community
 * @param communityId - The community's database ID
 */
export async function getCommunityFeatureFlags(
  communityId: string | undefined | null
): Promise<Record<CommunityFeatureFlag, boolean>> {
  if (!communityId) {
    // Return all defaults if no community ID
    return {
      slackIntegration: false,
      emailReminders: false,
      waitlist: false,
      rsvpLimits: false,
      recurringEvents: false,
      proposerWorkflow: false,
    };
  }

  try {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { features: true },
    });

    const defaultFlags = {
      slackIntegration: false,
      emailReminders: false,
      waitlist: false,
      rsvpLimits: false,
      recurringEvents: false,
      proposerWorkflow: false,
    };

    if (!community || !community.features) {
      return defaultFlags;
    }

    // Parse the features JSON
    const features = community.features as Record<string, unknown>;

    // Override defaults with any values from the database
    return Object.keys(defaultFlags).reduce(
      (result, flag) => {
        const typedFlag = flag as CommunityFeatureFlag;
        result[typedFlag] =
          typeof features[flag] === "boolean"
            ? (features[flag] as boolean)
            : defaultFlags[typedFlag];
        return result;
      },
      { ...defaultFlags }
    );
  } catch (error) {
    console.error("Error getting community feature flags:", error);
    return {
      slackIntegration: false,
      emailReminders: false,
      waitlist: false,
      rsvpLimits: false,
      recurringEvents: false,
      proposerWorkflow: false,
    };
  }
}
