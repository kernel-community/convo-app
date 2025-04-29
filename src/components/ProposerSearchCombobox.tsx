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
  onSelectUser: (user: DropdownUser | null) => void;
  existingProposerIds: Set<string>;
  disabled?: boolean;
}

export const ProposerSearchCombobox: React.FC<ProposerSearchComboboxProps> = ({
  selectedUserId,
  onSelectUser,
  existingProposerIds,
  disabled = false,
}) => {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState<DropdownUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Store the complete selected user details locally for display purposes
  const [selectedUserData, setSelectedUserData] = useState<DropdownUser | null>(
    null
  );

  // Use the debounce hook
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect to fetch users based on search query
  useEffect(() => {
    const searchUsers = async () => {
      console.log(
        "[Combobox useEffect search] Running. Query:",
        debouncedSearchQuery
      );
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
        console.log(
          "[Combobox useEffect search] API Response Status:",
          response.status
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        console.log("[Combobox useEffect search] API Data:", data);
        // Filter out users who are already proposers
        const filteredUsers = data.users.filter(
          (user: DropdownUser) => !existingProposerIds.has(user.id)
        );
        console.log(
          "[Combobox useEffect search] Filtered Users:",
          filteredUsers
        );
        setFetchedUsers(filteredUsers);
      } catch (error) {
        console.error(
          "[Combobox useEffect search] Error fetching users:",
          error
        );
        setFetchedUsers([]);
      } finally {
        console.log(
          "[Combobox useEffect search] Setting isSearching to false."
        );
        setIsSearching(false);
      }
    };
    searchUsers();
  }, [debouncedSearchQuery, existingProposerIds]);

  // Effect to update the *local* selected user data for display
  useEffect(() => {
    console.log(
      "[Combobox useEffect sync] Running. selectedUserId Prop:",
      selectedUserId
    );
    if (selectedUserId) {
      const userInFetched = fetchedUsers.find((u) => u.id === selectedUserId);
      if (userInFetched) {
        console.log(
          "[Combobox useEffect sync] Found user in fetched results:",
          userInFetched
        );
        setSelectedUserData(userInFetched);
      } else if (!selectedUserData || selectedUserData.id !== selectedUserId) {
        console.log(
          "[Combobox useEffect sync] User not in fetched or cached. Attempting individual fetch..."
        );
        const fetchUserData = async () => {
          try {
            const response = await fetch(`/api/query/users/${selectedUserId}`);
            console.log(
              "[Combobox useEffect sync] Individual Fetch Status:",
              response.status
            );
            if (response.ok) {
              const userData = await response.json();
              console.log(
                "[Combobox useEffect sync] Individual Fetch Data:",
                userData
              );
              setSelectedUserData(userData.user || userData);
            } else {
              console.log(
                "[Combobox useEffect sync] Individual Fetch failed. Setting local data to null."
              );
              setSelectedUserData(null);
            }
          } catch (error) {
            console.error(
              "[Combobox useEffect sync] Error fetching selected user data:",
              error
            );
            setSelectedUserData(null);
          }
        };
        fetchUserData();
      }
    } else {
      console.log(
        "[Combobox useEffect sync] selectedUserId prop is null. Clearing local data."
      );
      setSelectedUserData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, fetchedUsers]);

  // Only clear search when opening the popover, not on close
  useEffect(() => {
    console.log("[Combobox useEffect open] Running. Open state:", comboboxOpen);
    if (comboboxOpen) {
      console.log("[Combobox useEffect open] Clearing search query.");
      setSearchQuery("");
    }
  }, [comboboxOpen]);

  console.log(
    "[Combobox Render] selectedUserId (prop):",
    selectedUserId,
    "selectedUserData (local):",
    selectedUserData
  );

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
            "Search user by nickname..."
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
                      "[Combobox CommandItem onSelect] Selected ID:",
                      currentValue
                    );
                    const selected = fetchedUsers.find(
                      (u) => u.id === currentValue
                    );
                    console.log(
                      "[Combobox CommandItem onSelect] Found user object:",
                      selected
                    );
                    onSelectUser(selected || null);
                    setSelectedUserData(selected || null);
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
