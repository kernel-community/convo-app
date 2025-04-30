import { headers } from "next/headers";
import { prisma } from "src/utils/db";
import { isNil } from "lodash";
import isProd from "src/utils/isProd";

/**
 * Get community from the subdomain header set by middleware
 * This centralizes community resolution across all API endpoints
 * @returns The resolved community or throws an error if none found
 */
export async function getCommunityFromSubdomain() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");
  const originalHost = headersList.get("host") || "";

  if (!subdomain) {
    throw new Error(
      "Subdomain header missing - middleware may not be functioning properly"
    );
  }

  // Special case handling
  let targetSubdomain = subdomain;

  // Case 1: Request from localhost - use 'dev' community
  if (subdomain.startsWith("localhost")) {
    console.log(`Request from localhost - using 'dev' community`);
    targetSubdomain = "dev";
  }
  // Case 2: Request from root domain (convo.cafe without subdomain)
  // This handles case when x-subdomain is 'convo' (extracted from convo.cafe)
  else if (subdomain === "convo") {
    console.log(`Request from root domain - using 'kernel' community`);
    targetSubdomain = "kernel";
  }

  // Try to find community for the specified subdomain
  let community = await prisma.community.findUnique({
    where: { subdomain: targetSubdomain },
    include: {
      slack: true,
    },
  });

  // If no community found for the special cases or specified subdomain, fall back to default
  if (!community) {
    const defaultSubdomain = isProd(originalHost) ? "kernel" : "staging";

    console.log(
      `Community for subdomain '${targetSubdomain}' not found, trying default '${defaultSubdomain}'`
    );

    community = await prisma.community.findUnique({
      where: { subdomain: defaultSubdomain },
      include: {
        slack: true,
      },
    });
  }

  // If still no community, throw error
  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every request should belong to a community. Check database setup."
    );
  }

  return community;
}

/**
 * Get or create community from the subdomain header
 * Similar to getCommunityFromSubdomain but will create a default community if none exists
 * Use this when you need to ensure a community exists (e.g., during event creation)
 */
export async function getOrCreateCommunityFromSubdomain() {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain") || "kernel";

  try {
    // Try to get existing community
    let community = await prisma.community.findUnique({
      where: { subdomain },
      include: {
        slack: true,
      },
    });

    if (community) {
      console.log(
        `Using community for subdomain '${subdomain}':`,
        community.id
      );
      return community;
    }

    // If not found, try default kernel community
    community = await prisma.community.findUnique({
      where: { subdomain: "kernel" },
      include: {
        slack: true,
      },
    });

    // If default community exists, use that
    if (community) {
      console.log(
        `Community for subdomain '${subdomain}' not found, using default 'kernel' community`
      );
      return community;
    }

    // If no default community exists, create it
    console.log("Default community not found, creating it now");
    community = await prisma.community.create({
      data: {
        subdomain: "kernel",
        displayName: "Kernel",
        description: "Kernel Community",
        features: {
          slackIntegration: true,
          emailReminders: true,
          waitlist: true,
          rsvpLimits: true,
        },
      },
      include: {
        slack: true,
      },
    });

    console.log("Created new default community:", community.id);
    return community;
  } catch (error) {
    console.error("Error resolving community:", error);
    throw new Error("Failed to resolve or create community");
  }
}
