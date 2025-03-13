import { flag } from "flags/next";
import { dedupe } from "flags/next";

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

// List of beta users who should have beta mode enabled
const BETA_USERS = [
  "angela.gilhotra@gmail.com",
  // Add more beta users as needed
];

// Beta mode flag - enables beta features for specific users
export const betaMode = flag<boolean, ConvoEntities>({
  key: "beta-mode",
  identify: identifyUser,
  decide({ entities }) {
    const userEmail = entities?.user?.email;

    // Check if user is in beta list, has @kernel.community email, or has +convobeta in email
    const isEnabled =
      (userEmail && BETA_USERS.includes(userEmail)) ||
      (userEmail?.endsWith("@kernel.community") ?? false) ||
      (userEmail?.includes("+convobeta") ?? false);

    console.log("[Flags] Beta mode:", {
      isEnabled,
      email: userEmail,
    });

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
  decide({ entities }) {
    const userEmail = entities?.user?.email;

    // Check if user is in beta list, has @kernel.community email, or has +convobeta in email
    const isEnabled =
      (userEmail && BETA_USERS.includes(userEmail)) ||
      (userEmail?.endsWith("@kernel.community") ?? false) ||
      (userEmail?.includes("+convobeta") ?? false);

    console.log("[Flags] Experimental UI:", {
      isEnabled,
      email: userEmail,
    });

    return isEnabled;
  },
});
