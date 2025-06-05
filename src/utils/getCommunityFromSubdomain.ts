import { headers } from "next/headers";
import { prisma } from "src/utils/db";
import { isNil } from "lodash";
import isProd from "src/utils/isProd";

/**
 * Get community from the subdomain by parsing the host header directly
 * This centralizes community resolution across all API endpoints
 * @returns The resolved community or throws an error if none found
 */
export async function getCommunityFromSubdomain() {
  const headersList = headers();
  const originalHost = headersList.get("host") || "";

  // Extract subdomain directly from host header
  let subdomain = originalHost.split(".")[0];

  // Fallback to x-subdomain header if it exists (for middleware compatibility)
  const middlewareSubdomain = headersList.get("x-subdomain");
  if (middlewareSubdomain && middlewareSubdomain !== "default") {
    subdomain = middlewareSubdomain;
  }

  if (!subdomain) {
    console.warn("No subdomain found, using 'kernel' as fallback");
    subdomain = "kernel";
  }

  // Special case handling
  let targetSubdomain = subdomain;

  // Case 1: Request from localhost - but only if subdomain is actually "localhost"
  // If the x-subdomain header is set to something specific (like in tests), use that
  if (subdomain === "localhost") {
    console.log(`Request from localhost - using 'dev' community as default`);
    targetSubdomain = "dev";
  }
  // Case 2: Request from root domain (convo.cafe without subdomain)
  // This handles case when x-subdomain is 'convo' (extracted from convo.cafe)
  else if (subdomain === "convo") {
    console.log(`Request from root domain - using 'kernel' community`);
    targetSubdomain = "kernel";
  }

  console.log(
    `Resolving community for subdomain: ${targetSubdomain} (original: ${subdomain})`
  );

  // Try to find community for the specified subdomain
  const community = await prisma.community.findUnique({
    where: { subdomain: targetSubdomain },
    include: {
      slack: true,
    },
  });

  // If still no community, throw error with helpful message
  if (!community || isNil(community)) {
    const availableCommunities = await prisma.community.findMany({
      select: { subdomain: true, displayName: true },
    });

    throw new Error(
      `Community not found for subdomain '${targetSubdomain}'. Available communities: ${availableCommunities
        .map((c) => `${c.displayName} (${c.subdomain})`)
        .join(", ")}`
    );
  }

  console.log(
    `✅ Resolved to community: ${community.displayName} (${community.subdomain}) - ID: ${community.id}`
  );
  return community;
}

/**
 * Get or create community from the subdomain header
 * Similar to getCommunityFromSubdomain but will create a default community if none exists
 * Use this when you need to ensure a community exists (e.g., during event creation)
 */
export async function getOrCreateCommunityFromSubdomain() {
  const headersList = headers();
  const originalHost = headersList.get("host") || "";

  // Extract subdomain directly from host header
  let subdomain = originalHost.split(".")[0] || "kernel";

  // Fallback to x-subdomain header if it exists (for middleware compatibility)
  const middlewareSubdomain = headersList.get("x-subdomain");
  if (middlewareSubdomain && middlewareSubdomain !== "default") {
    subdomain = middlewareSubdomain;
  }

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
