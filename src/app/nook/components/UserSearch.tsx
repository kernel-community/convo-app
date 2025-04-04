import React from "react";
import type { User } from "../utils/types";

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: User[];
  onSelectUser: (userId: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  onSelectUser,
}) => {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search users. Start typing user's name ... "
        className="rounded w-full border border-gray-300 p-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchResults.length > 0 && (
        <div className="rounded absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg">
          {searchResults.map((user) => (
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
