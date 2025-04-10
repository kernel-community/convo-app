import { flag } from "flags/next";
import { dedupe } from "flags/next";
import { cache } from "react";

// Define our entities type for type safety
interface ConvoEntities {
  user?: {
    email?: string;
    id?: string;
  };
}

// Helper to identify users
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const identifyUser = dedupe(({ headers, cookies }) => {
  const sessionCookie = cookies.get("session");
  if (!sessionCookie?.value) return { user: {} };

  try {
    const { id, email } = JSON.parse(sessionCookie.value);
    console.log("[Flags] Identified user from session:", { id, email });
    return {
      user: {
        id,
        email,
      },
    };
  } catch (error) {
    console.error("[Flags] Error parsing session:", error);
    return { user: {} };
  }
});

// Function to check beta access via API, cached to prevent duplicate requests
const checkBetaAccessViaApi = cache(async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/beta-access/check`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        next: { tags: ["beta-access"] },
      }
    );

    if (!response.ok) {
      console.error("[Flags] Beta access check failed:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("[Flags] Beta access API response:", data);
    return data.hasBetaAccess;
  } catch (error) {
    console.error("[Flags] Error checking beta access via API:", error);
    return false;
  }
});

import { prisma } from "src/utils/db";

// Beta mode flag - enables beta features for specific users
export const betaMode = flag<boolean, ConvoEntities>({
  key: "beta-mode",
  identify: identifyUser,
  async decide({ entities }) {
    const userEmail = entities?.user?.email;
    const userId = entities?.user?.id;

    // First check the database for the isBeta flag if we have a userId
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, isBeta: true },
        });

        if (user?.isBeta) {
          console.log("[Flags] Beta mode enabled via database isBeta flag:", {
            userId,
            email: userEmail,
          });
          return true;
        }
      } catch (error) {
        console.error(
          "[Flags] Error checking database for beta status:",
          error
        );
      }
    }

    // Then check if email is from a known beta domain
    let isEnabled = false;

    if (userEmail) {
      const email = userEmail.toLowerCase();
      isEnabled =
        email.endsWith("@kernel.community") || email.endsWith("@convo.cafe");

      console.log("[Flags] Beta mode domain check:", {
        isEnabled,
        userId,
        email: userEmail,
      });
    }

    // If we don't have an email or it's not from a beta domain, log it
    if (!isEnabled) {
      console.log("[Flags] Beta mode denied:", {
        userId,
        email: userEmail,
      });
    }

    return isEnabled;
  },
});

// New cursor rooms feature flag
export const newCursorRooms = flag<boolean>({
  key: "new-cursor-rooms",
  decide() {
    // This feature is now stable and always enabled
    return true;
  },
});

// Experimental UI components flag
export const experimentalUI = flag<boolean, ConvoEntities>({
  key: "experimental-ui",
  identify: identifyUser,
  async decide({ entities }) {
    const userEmail = entities?.user?.email;
    const userId = entities?.user?.id;

    // If we have a user ID, check via the API
    if (userId) {
      try {
        const hasBetaAccess = await checkBetaAccessViaApi();

        console.log("[Flags] Experimental UI via API:", {
          isEnabled: hasBetaAccess,
          userId,
          email: userEmail,
        });

        return hasBetaAccess;
      } catch (error) {
        console.error(
          "[Flags] Error checking beta access for experimental UI:",
          error
        );
      }
    }

    // Fallback to simple email check if API fails or no user ID
    const isEnabled = userEmail?.endsWith("@kernel.community") ?? false;

    console.log("[Flags] Experimental UI fallback:", {
      isEnabled,
      email: userEmail,
    });

    return isEnabled;
  },
});
