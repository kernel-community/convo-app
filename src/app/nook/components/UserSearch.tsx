import React, { useState } from "react";
import type { User } from "../utils/types";

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: User[];
  onSelectUser: (userId: string) => void;
  allUsers?: User[];
}

const UserSearch: React.FC<UserSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  onSelectUser,
  allUsers = [],
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine which results to show - if searching, show search results, otherwise show all users
  const displayResults =
    searchTerm.trim() !== ""
      ? searchResults
      : allUsers.length > 0
      ? allUsers
      : searchResults;
  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search users or click to see all..."
        className="rounded w-full border border-gray-300 p-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsDropdownOpen(true)}
        onBlur={() => {
          // Delay hiding the dropdown to allow for clicks on dropdown items
          setTimeout(() => setIsDropdownOpen(false), 200);
        }}
      />
      {isDropdownOpen && displayResults.length > 0 && (
        <div className="rounded absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg">
          {displayResults.map((user) => (
            <div
              key={user.id}
              className="cursor-pointer p-2 hover:bg-indigo-50"
              onClick={() => {
                onSelectUser(user.id);
                setSearchTerm("");
              }}
            >
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
