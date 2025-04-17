"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useUser } from "src/context/UserContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User2, LogOut, ChevronDown, PenSquare } from "lucide-react";
import SignOutCredenza from "../SignOutCredenza";
import useProfile from "src/hooks/useProfile";
import { getDefaultProfilePicture } from "src/utils/constants";

export const ConnectButton = () => {
  const { fetchedUser: user, handleSignOut: userContextSignOut } = useUser();
  const { setShowAuthFlow } = useDynamicContext();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: profile } = useProfile({ userId: user?.id });

  // Sync state with user.isSignedIn for more consistent rendering
  useEffect(() => {
    setIsSignedIn(user?.isSignedIn);
  }, [user?.isSignedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    // Immediately update local state for a responsive UI
    setIsSignedIn(false);

    try {
      // Use the handleSignOut from UserContext which handles immediate UI updates
      await userContextSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
      // If sign out fails, revert the state
      setIsSignedIn(user?.isSignedIn || false);
    } finally {
      setIsSigningOut(false);
      setIsDropdownOpen(false);
      setIsSignOutDialogOpen(false);
    }
  };

  if (isSignedIn) {
    // Get profile image URL from the profile data, using the new function as fallback
    const profileImage = profile?.image || getDefaultProfilePicture(user?.id);

    return (
      <div ref={dropdownRef} className="relative">
        <div className="hidden">
          <DynamicWidget />
        </div>

        {/* Pill-shaped button */}
        <motion.div
          className="bg-primary/10 border-primary/20 hover:bg-primary/15 flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
            <img
              src={profileImage}
              alt={user?.nickname || "User"}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-medium">{user?.nickname}</span>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              className="bg-card absolute right-0 z-10 mt-2 w-48 rounded-md border border-border shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <ul className="py-1">
                <li>
                  <motion.button
                    className="hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-2 text-sm"
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      router.push("/profile");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <User2 className="h-4 w-4" />
                    Profile
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    className="hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-2 text-sm"
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      router.push("/profile?edit=true");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <PenSquare className="h-4 w-4" />
                    Edit profile
                  </motion.button>
                </li>
                <li className="mt-1 border-t border-border pt-1">
                  <motion.button
                    className="hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive"
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      setIsSignOutDialogOpen(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </motion.button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign Out Dialog */}
        <SignOutCredenza
          open={isSignOutDialogOpen}
          onOpenChange={setIsSignOutDialogOpen}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    );
  }

  return (
    <motion.div
      key="signed-out"
      onClick={() => {
        setShowAuthFlow(true);
      }}
      className="bg-primary/10 border-primary/20 hover:bg-primary/15 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      Log in
    </motion.div>
  );
};
