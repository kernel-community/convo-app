import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "src/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { UserImage } from "src/components/ui/default-user-image";
import { cn } from "src/lib/utils";

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

// Define type for fetched users in dropdown (same as in Hero.tsx)
type DropdownUser = {
  id: string;
  nickname: string;
  image: string | null;
};

interface ProposerSearchComboboxProps {
  selectedUserId: string | null;
  onSelectUserId: (id: string | null) => void;
  existingProposerIds: Set<string>;
  disabled?: boolean;
}

export const ProposerSearchCombobox: React.FC<ProposerSearchComboboxProps> = ({
  selectedUserId,
  onSelectUserId,
  existingProposerIds,
  disabled = false,
}) => {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState<DropdownUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Store the complete selected user details rather than just the name
  const [selectedUserData, setSelectedUserData] = useState<DropdownUser | null>(
    null
  );

  // Use the debounce hook
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect to fetch users based on search query
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchQuery.length < 2) {
        setFetchedUsers([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/query/users?search=${encodeURIComponent(debouncedSearchQuery)}`
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        // Filter out users who are already proposers
        setFetchedUsers(
          data.users.filter(
            (user: DropdownUser) => !existingProposerIds.has(user.id)
          )
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        setFetchedUsers([]);
      } finally {
        setIsSearching(false);
      }
    };
    searchUsers();
  }, [debouncedSearchQuery, existingProposerIds]);

  // Effect to update the selected user data when id changes or when discovered in search results
  useEffect(() => {
    if (selectedUserId) {
      // First, check if the user is in our current search results
      const userInSearchResults = fetchedUsers.find(
        (u) => u.id === selectedUserId
      );

      if (userInSearchResults) {
        // If found in search results, update our cached data
        setSelectedUserData(userInSearchResults);
      } else if (!selectedUserData || selectedUserData.id !== selectedUserId) {
        // If not found and we don't have cached data for this id, fetch the user data
        const fetchUserData = async () => {
          try {
            const response = await fetch(`/api/query/users/${selectedUserId}`);
            if (response.ok) {
              const userData = await response.json();
              setSelectedUserData(userData.user);
            } else {
              console.error("Failed to fetch user data");
              setSelectedUserData(null);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setSelectedUserData(null);
          }
        };

        fetchUserData();
      }
    } else {
      // If no user is selected, clear the cached data
      setSelectedUserData(null);
    }
  }, [selectedUserId, fetchedUsers]);

  // Only clear search when opening the popover, not on close
  useEffect(() => {
    if (comboboxOpen) {
      setSearchQuery("");
    }
  }, [comboboxOpen]);

  return (
    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={comboboxOpen}
          className="flex-grow justify-between bg-background text-foreground"
          disabled={disabled}
          onClick={() => setComboboxOpen(!comboboxOpen)}
        >
          {selectedUserId && selectedUserData ? (
            <span className="flex items-center gap-2">
              <UserImage
                userId={selectedUserId}
                photo={selectedUserData.image}
                size="sm"
              />
              {selectedUserData.nickname}
            </span>
          ) : (
            "Select user by nickname..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false} loop={true} className="overflow-visible">
          <CommandInput
            placeholder="Search nickname..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={isSearching}
          />
          <CommandList>
            {isSearching && <CommandEmpty>Loading...</CommandEmpty>}
            {!isSearching &&
              fetchedUsers.length === 0 &&
              searchQuery.length > 1 && (
                <CommandEmpty>No users found.</CommandEmpty>
              )}
            {!isSearching &&
              fetchedUsers.length === 0 &&
              searchQuery.length < 2 && (
                <CommandEmpty>Type 2+ chars to search.</CommandEmpty>
              )}

            <CommandGroup value="search-results">
              {fetchedUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  className="pointer-events-auto cursor-pointer opacity-100 hover:bg-accent"
                  onSelect={(currentValue) => {
                    console.log(
                      "[Combobox CommandItem onSelect] Fired! Value:",
                      currentValue
                    );
                    const selected = fetchedUsers.find(
                      (u) => u.id === currentValue
                    );
                    if (selected) {
                      // Store the complete user data when selected
                      setSelectedUserData(selected);
                      onSelectUserId(currentValue);
                    } else {
                      onSelectUserId(null);
                    }
                    setComboboxOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="pointer-events-auto flex items-center gap-2 opacity-100">
                    <UserImage userId={user.id} photo={user.image} size="sm" />
                    {user.nickname}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
