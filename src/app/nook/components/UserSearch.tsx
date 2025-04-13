import React, { useState, useRef } from "react";
import type { User } from "../utils/types";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { UserAvatar } from "./Profile";

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: User[];
  onSelectUser: (userId: string) => void;
  allUsers?: User[];
  currentUser?: User;
  currentUserId?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  onSelectUser,
  allUsers = [],
  currentUser,
  currentUserId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine which results to show - if searching, show search results, otherwise show all users
  const displayResults =
    searchTerm.trim() !== ""
      ? searchResults
      : allUsers.length > 0
      ? allUsers
      : searchResults;

  // Toggle expansion state
  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Focus the input when expanded
    if (newExpandedState && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Wait for animation to complete
    } else {
      // Clear search when collapsed
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      {/* User Avatar - Now positioned at top right */}
      {currentUser && currentUserId && (
        <div className="absolute right-3 top-3 z-[1001]">
          <motion.div
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-3 shadow-md backdrop-blur-sm"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelectUser(currentUserId)}
          >
            <UserAvatar
              currentUser={currentUser}
              currentUserId={currentUserId}
              onSelectUser={onSelectUser}
              size={36}
            />
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-sm font-medium text-gray-800">
                {currentUser.name.split(" ")[0]}
              </span>
              <span className="-mt-1 text-xs text-gray-500">You</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search Component - Still at top left */}
      <div className="absolute left-3 top-3 z-[1001]">
        <motion.div
          initial={{ width: "42px" }}
          animate={{
            width: isExpanded ? "300px" : "42px",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Combined container for icon and input */}
          <motion.div
            className="relative flex items-center overflow-hidden bg-white shadow-md"
            initial={{ borderRadius: "50%" }}
            animate={{
              borderRadius: isExpanded ? "24px" : "50%",
            }}
            whileHover={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Search Icon - Always visible */}
            <motion.button
              className="flex h-[42px] min-w-[42px] items-center justify-center text-secondary"
              onClick={toggleExpand}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={18} />
            </motion.button>

            {/* Expandable Search Input */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="flex-grow"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for connections..."
                    className="w-full border-none bg-transparent py-2 pr-4 text-sm outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => {
                      // Delay hiding the dropdown to allow for clicks on dropdown items
                      setTimeout(() => setIsDropdownOpen(false), 200);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Dropdown Results */}
          <AnimatePresence>
            {isExpanded && isDropdownOpen && displayResults.length > 0 && (
              <motion.div
                className="absolute left-0 right-0 z-[1002] mt-2 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {displayResults.map((user) => (
                    <motion.div
                      key={user.id}
                      className="flex cursor-pointer items-center border-b border-gray-50 px-4 py-2.5 text-sm"
                      whileHover={{
                        backgroundColor: "var(--secondary-light)",
                        color: "var(--secondary)",
                      }}
                      onClick={() => {
                        onSelectUser(user.id);
                        setSearchTerm("");
                        toggleExpand();
                      }}
                    >
                      {user.profile?.image && (
                        <div className="mr-2 h-6 w-6 overflow-hidden rounded-full border border-gray-100">
                          <img
                            src={user.profile.image}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <span>{user.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default UserSearch;
