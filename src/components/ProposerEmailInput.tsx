import React, { useState, useEffect } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { UserImage } from "src/components/ui/default-user-image";
import { useDebounce } from "src/hooks/useDebounce";

// Type for user data returned from API
type UserData = {
  id?: string;
  email: string;
  nickname: string;
  image?: string | null;
  exists: boolean;
};

interface ProposerEmailInputProps {
  onInviteUser: (userData: UserData) => void;
  existingProposerEmails: Set<string>;
  disabled?: boolean;
}

export const ProposerEmailInput: React.FC<ProposerEmailInputProps> = ({
  onInviteUser,
  existingProposerEmails,
  disabled = false,
}) => {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce email input
  const debouncedEmail = useDebounce(email, 500);

  // Effect to search user by email
  useEffect(() => {
    const searchUserByEmail = async () => {
      if (!debouncedEmail) {
        setUserData(null);
        setError(null);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        setUserData(null);
        setError("Please enter a valid email address");
        return;
      }

      // Check if user is already a proposer
      if (existingProposerEmails.has(debouncedEmail)) {
        setUserData(null);
        setError("This user is already a proposer");
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/query/user-by-email?email=${encodeURIComponent(debouncedEmail)}`
        );

        if (!response.ok) {
          throw new Error("Failed to search user");
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        console.error("Error searching user:", error);
        setError("Failed to search user");
        setUserData(null);
      } finally {
        setIsSearching(false);
      }
    };

    searchUserByEmail();
  }, [debouncedEmail, existingProposerEmails]);

  const handleInvite = () => {
    if (userData) {
      onInviteUser(userData);
      setEmail("");
      setUserData(null);
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData && !error) {
      e.preventDefault();
      handleInvite();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-grow">
          <Input
            type="email"
            placeholder="Enter email address to invite..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="bg-background text-foreground"
          />

          {/* User preview */}
          {userData && !error && (
            <div className="bg-muted/30 mt-2 flex items-center gap-2 rounded-md border p-2">
              {userData.exists && userData.id ? (
                <UserImage
                  userId={userData.id}
                  photo={userData.image}
                  size="sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  {userData.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-grow">
                <div className="font-medium">
                  {userData.exists ? userData.nickname : userData.email}
                </div>
                {userData.exists && (
                  <div className="text-sm text-muted-foreground">
                    {userData.email}
                  </div>
                )}
                {!userData.exists && (
                  <div className="text-sm text-muted-foreground">
                    New user - will be invited
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

          {/* Loading indicator */}
          {isSearching && (
            <p className="mt-1 text-sm text-muted-foreground">Searching...</p>
          )}

          {/* Help text */}
          {!userData && !error && !isSearching && email.length === 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an email address to invite someone as a co-proposer.
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={handleInvite}
          variant="outline"
          disabled={!userData || !!error || disabled}
          className="shrink-0"
        >
          Invite
        </Button>
      </div>
    </div>
  );
};
