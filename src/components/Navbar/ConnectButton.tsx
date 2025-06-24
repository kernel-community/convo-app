"use client";

import {
  SignInButton,
  UserButton,
  useUser as useClerkUser,
} from "@clerk/nextjs";
import { useUser } from "src/context/UserContext";
import { motion } from "framer-motion";
import { CommunityProfilePage } from "src/components/Profile/CommunityProfilePage";
import { User } from "lucide-react";
import { useEffect, useRef } from "react";

export const ConnectButton = () => {
  const { isSignedIn } = useClerkUser();
  const { fetchedUser } = useUser();
  const userButtonRef = useRef<HTMLDivElement>(null);

  // Handle custom events to open user profile
  useEffect(() => {
    const handleOpenUserProfile = (event: CustomEvent) => {
      const { page } = event.detail || {};

      // Find and click the UserButton to open the modal
      if (userButtonRef.current) {
        const userButton = userButtonRef.current.querySelector("button");
        if (userButton) {
          userButton.click();

          // If a specific page is requested, we'll need to navigate to it
          // This is a simplified approach - in a more complex implementation,
          // you might want to use Clerk's programmatic API
          if (page === "community-profile") {
            // The user will need to click on the Community Profile tab
            // after the modal opens. This could be enhanced with more
            // sophisticated modal state management.
          }
        }
      }
    };

    window.addEventListener(
      "clerk:openUserProfile",
      handleOpenUserProfile as EventListener
    );

    return () => {
      window.removeEventListener(
        "clerk:openUserProfile",
        handleOpenUserProfile as EventListener
      );
    };
  }, []);

  if (isSignedIn && fetchedUser?.isSignedIn) {
    return (
      <div ref={userButtonRef}>
        <UserButton
          afterSignOutUrl="/"
          userProfileMode="modal"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full",
              userButtonPopoverCard:
                "shadow-lg border border-border bg-popover",
              userButtonPopoverActions: "bg-popover",
              userButtonPopoverActionButton: "hover:bg-muted/50 text-sm",
              userButtonPopoverActionButtonText: "text-foreground",
              userButtonPopoverFooter: "hidden",
            },
          }}
        >
          {/* Community Profile Page */}
          <UserButton.UserProfilePage
            label="Community Profile"
            url="community-profile"
            labelIcon={<User className="h-4 w-4" />}
          >
            <CommunityProfilePage />
          </UserButton.UserProfilePage>

          {/* Reorder default pages to put community profile first */}
          <UserButton.UserProfilePage label="account" />
          <UserButton.UserProfilePage label="security" />
        </UserButton>
      </div>
    );
  }

  return (
    <SignInButton mode="modal" withSignUp>
      <motion.div
        className="bg-primary/10 border-primary/20 hover:bg-primary/15 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Log in
      </motion.div>
    </SignInButton>
  );
};
