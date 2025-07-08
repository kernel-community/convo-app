import { flag } from "flags/next";
import { dedupe } from "flags/next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "src/utils/db";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

// Define our entities type for type safety
interface ConvoEntities {
  user?: {
    email?: string;
    id?: string;
  };
}

// Helper to identify users using Clerk with error handling
const identifyUser = dedupe(async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { user: {} };
    }
    return { user: { id: userId } };
  } catch (error) {
    // If auth fails (e.g., no middleware context), return empty user
    console.log(
      "[Flags] Auth not available in current context, proceeding without user identification"
    );
    return { user: {} };
  }
});

// Beta mode flag - enables beta features for specific users
export const betaMode = flag<boolean, ConvoEntities>({
  key: "beta-mode",
  identify: identifyUser,
  async decide({ entities }) {
    const userId = entities?.user?.id;

    if (!userId) {
      console.log("[Flags] Beta mode denied - no user ID found");
      return false;
    }

    try {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, isBeta: true },
      });

      if (!user?.email) {
        console.log(
          "[Flags] Beta mode denied - no email found for user:",
          userId
        );
        return false;
      }

      // Check database flag first
      if (user.isBeta) {
        console.log("[Flags] Beta mode enabled via database flag:", {
          userId,
          email: user.email,
        });
        return true;
      }

      // Check email domains
      const email = user.email.toLowerCase();
      const isEnabled =
        email.endsWith("@kernel.community") || email.endsWith("@convo.cafe");

      console.log("[Flags] Beta mode domain check:", {
        isEnabled,
        userId,
        email: user.email,
      });

      return isEnabled;
    } catch (error) {
      console.error("[Flags] Error checking beta access:", error);
      return false;
    }
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
    const userId = entities?.user?.id;

    if (!userId) {
      console.log("[Flags] Experimental UI denied - no user ID found");
      return false;
    }

    try {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, isBeta: true },
      });

      if (!user?.email) {
        console.log(
          "[Flags] Experimental UI denied - no email found for user:",
          userId
        );
        return false;
      }

      // Check database flag first
      if (user.isBeta) {
        console.log("[Flags] Experimental UI enabled via database flag:", {
          userId,
          email: user.email,
        });
        return true;
      }

      // Check email domains
      const email = user.email.toLowerCase();
      const isEnabled =
        email.endsWith("@kernel.community") || email.endsWith("@convo.cafe");

      console.log("[Flags] Experimental UI domain check:", {
        isEnabled,
        userId,
        email: user.email,
      });

      return isEnabled;
    } catch (error) {
      console.error("[Flags] Error checking experimental UI access:", error);
      return false;
    }
  },
});

// Fellow access flag - enables access to fellow-only features
export const isFellow = flag<boolean, ConvoEntities>({
  key: "is-fellow",
  identify: identifyUser,
  async decide({ entities }) {
    const userId = entities?.user?.id;

    if (!userId) {
      console.log("[Flags] Fellow access denied - no user ID found");
      return false;
    }

    try {
      // Get the current community from subdomain
      const community = await getCommunityFromSubdomain();

      // Check if user has a profile with isCoreMember set to true in this community
      const profile = await prisma.profile.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: community.id,
          },
        },
        select: { isCoreMember: true },
      });

      // Get user email to check for @kernel.community domain
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const isCoreMember = profile?.isCoreMember || false;
      const hasKernelEmail =
        user?.email?.toLowerCase().endsWith("@kernel.community") || false;
      const isEnabled = isCoreMember || hasKernelEmail;

      console.log("[Flags] Fellow access check:", {
        isEnabled,
        userId,
        communityId: community.id,
        communityName: community.displayName,
        isCoreMember: profile?.isCoreMember,
        hasKernelEmail,
        email: user?.email,
      });

      return isEnabled;
    } catch (error) {
      console.error("[Flags] Error checking fellow access:", error);
      return false;
    }
  },
});
