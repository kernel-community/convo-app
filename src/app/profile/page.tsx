"use client";

import { useEffect, useState, useRef, ChangeEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  Globe,
  Briefcase,
  Tag,
  Link as LinkIcon,
  Shuffle,
  Loader2,
  Check,
  X,
  PenSquare,
} from "lucide-react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { pick } from "lodash";

import Main from "src/layouts/Main";
import { useUser } from "src/context/UserContext";
import useProfile from "src/hooks/useProfile";
import useUpdateProfile from "src/hooks/useUpdateProfile";
import useUpdateUser from "src/hooks/useUpdateUser";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import type { Profile as ProfileType, User } from "@prisma/client";
import {
  getDefaultProfilePicture,
  DEFAULT_PROFILE_PICTURES,
} from "src/utils/constants";
import { Separator } from "src/components/ui/separator";
import { useCommunity } from "src/hooks/useCommunity";

// Create a simple Textarea component if not available
const Textarea = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
      className || ""
    }`}
    rows={rows}
  />
);

const ProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchedUser, handleSignOut, setFetchedUser } = useUser();
  const { isSignedIn, isLoaded, user: clerkUser } = useClerkUser();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [keywordInput, setKeywordInput] = useState<string>("");

  // Simplified authentication state - use Clerk's state
  const isAuthenticated = isLoaded && isSignedIn && fetchedUser?.isSignedIn;
  const isLoading = !isLoaded;

  // Get current community information
  const { community, isLoading: communityLoading } = useCommunity();

  // Profile data
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile({
    userId: fetchedUser?.id,
  });
  const [profileAttributes, setProfileAttributes] = useState<
    Partial<ProfileType>
  >({});
  const [userAttributes, setUserAttributes] = useState<Partial<User>>({});

  const { fetch: updateProfile, isLoading: isUpdatingProfile } =
    useUpdateProfile(profileAttributes);
  const { fetch: updateUser, isLoading: isUpdatingUser } =
    useUpdateUser(userAttributes);

  // Add a counter state for forcing re-renders
  const [renderKey, setRenderKey] = useState(0);

  // Force a re-render programmatically
  const forceUpdate = () => setRenderKey((prev) => prev + 1);

  // New form state to track all edits until submission (excluding image)
  const [formState, setFormState] = useState<{
    profile: Partial<Omit<ProfileType, "image">>;
    user: Partial<User>;
  }>({
    profile: {},
    user: {},
  });

  // State for nickname uniqueness check
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameUnique, setIsNicknameUnique] = useState<boolean | null>(
    null
  );
  const [nicknameCheckError, setNicknameCheckError] = useState<string | null>(
    null
  );
  const [lastCheckedNickname, setLastCheckedNickname] = useState<string | null>(
    null
  );
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing

  // Check if we should enter edit mode from URL params
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "true" && !isEditing && isAuthenticated) {
      // Initialize form state with current data (excluding image)
      setFormState({
        profile: {
          ...(profile
            ? pick(profile, [
                "bio",
                "currentAffiliation",
                "url",
                "keywords",
                "userId",
              ])
            : {}),
          userId: fetchedUser?.id,
        },
        user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
      });

      // Enter edit mode
      setIsEditing(true);
    } else if (editParam !== "true" && isEditing) {
      // If URL param is removed, exit edit mode
      setIsEditing(false);
    }
  }, [searchParams, isAuthenticated, isEditing, profile, fetchedUser]);

  // Set profile data once loaded and initialize form state
  useEffect(() => {
    // Always update the base profileAttributes and userAttributes
    if (profile) {
      setProfileAttributes(profile);
    }

    if (fetchedUser) {
      const userData = pick(fetchedUser, ["nickname", "id"]);
      setUserAttributes(userData);
    }

    // Only initialize form state if we're not in edit mode to avoid resetting during editing
    if (!isEditing) {
      if (profile || fetchedUser) {
        setFormState({
          profile: {
            ...(profile
              ? pick(profile, [
                  "bio",
                  "currentAffiliation",
                  "url",
                  "keywords",
                  "userId",
                ])
              : {}),
            userId: fetchedUser?.id,
          },
          user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
        });
      }
    }
  }, [profile, fetchedUser, isEditing]);

  // Effect for debounced nickname check
  useEffect(() => {
    // Only run when editing and nickname exists
    if (!isEditing || !formState.user.nickname) {
      // Reset check state if nickname is cleared or not editing
      setIsCheckingNickname(false);
      setIsNicknameUnique(null);
      setNicknameCheckError(null);
      setLastCheckedNickname(null);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      return;
    }

    const currentNickname = formState.user.nickname.trim();

    // Don't check if it's the same as the original nickname or the last checked one
    if (
      currentNickname === userAttributes.nickname ||
      currentNickname === lastCheckedNickname
    ) {
      // If it matches the original, it's implicitly 'unique' for this user
      if (currentNickname === userAttributes.nickname) {
        setIsNicknameUnique(true);
        setNicknameCheckError(null);
        setIsCheckingNickname(false);
        setLastCheckedNickname(currentNickname);
        if (debounceTimeoutRef.current)
          clearTimeout(debounceTimeoutRef.current);
      } else {
        // If it's same as last checked, maintain current state
        // (no need to clear timeout here, let the latest check run if pending)
      }
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state immediately for feedback
    setIsCheckingNickname(true);
    setIsNicknameUnique(null); // Reset uniqueness status
    setNicknameCheckError(null);

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/user/check-nickname?nickname=${encodeURIComponent(
            currentNickname
          )}&userId=${fetchedUser?.id || ""}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Nickname check failed");
        }
        const data = await response.json();
        setIsNicknameUnique(data.isUnique);
        setNicknameCheckError(null);
        setLastCheckedNickname(currentNickname); // Store the nickname that was checked
      } catch (error) {
        console.error("Nickname check error:", error);
        setNicknameCheckError(
          error instanceof Error ? error.message : "Error checking nickname"
        );
        setIsNicknameUnique(null); // Ensure uniqueness is null on error
        setLastCheckedNickname(currentNickname); // Still store it to prevent re-check loop on error
      } finally {
        setIsCheckingNickname(false);
      }
    }, 200); // Reduced debounce delay to 200ms

    // Cleanup function to clear timeout if component unmounts or nickname changes again
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    formState.user.nickname,
    userAttributes.nickname,
    fetchedUser?.id,
    isEditing,
    lastCheckedNickname,
  ]);

  // Handle sign out with improved state management
  const handleProfileSignOut = async () => {
    // Start loading state
    setIsSigningOut(true);

    try {
      // Proceed with context logout (async operation)
      await handleSignOut();
    } finally {
      // Ensure we always clean up state even if an error occurs
      setIsSigningOut(false);
      setIsSignOutDialogOpen(false);
    }
  };

  // Handle profile update
  const handleSubmit = async () => {
    try {
      console.log("About to update user with data:", formState.user);

      // Pass form state directly to update functions
      const userResult = await updateUser(formState.user);
      console.log("User update result:", userResult);

      // Make sure userId is included in profile data
      const profileData = {
        ...formState.profile,
        userId: fetchedUser?.id,
      };

      console.log("About to update profile with data:", profileData);
      const profileResult = await updateProfile(profileData);
      console.log("Profile update result:", profileResult);

      // After successful update, update the state variables
      setProfileAttributes(profileData);
      setUserAttributes(formState.user);

      // Update the UserContext to reflect the changes immediately
      // This ensures the navbar and other components using UserContext update
      if (userResult && formState.user.nickname) {
        setFetchedUser({
          ...fetchedUser,
          nickname: formState.user.nickname,
          // Keep any other fields from the result that might have changed
          ...userResult,
        });
      }

      console.log("Update completed successfully, updating URL");

      // Clear the edit=true parameter from URL
      if (searchParams.get("edit") === "true") {
        await router.replace("/profile");
      }

      // Refetch the profile data to ensure we have the latest data
      await refetchProfile();
      console.log("Profile data refetched");

      // Exit edit mode
      setIsEditing(false);

      // Force a re-render to ensure we see the updated data
      forceUpdate();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(
        `Update failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle keyword addition
  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formState.profile.keywords?.includes(keywordInput.trim())
    ) {
      setFormState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          keywords: [...(prev.profile.keywords || []), keywordInput.trim()],
        },
      }));
      setKeywordInput("");
    }
  };

  // Handle keyword removal
  const removeKeyword = (keyword: string) => {
    setFormState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        keywords: (prev.profile.keywords || []).filter((k) => k !== keyword),
      },
    }));
  };

  // Add state for sign out dialog
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Add a function to handle cancel edits
  const handleCancelEdit = async () => {
    // First clear the URL parameter
    await router.replace("/profile");

    // Reset form state to match current profile and user data (excluding image)
    setFormState({
      profile: profile
        ? pick(profile, [
            "bio",
            "currentAffiliation",
            "url",
            "keywords",
            "userId",
          ])
        : {},
      user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
    });

    // Reset keyword input
    setKeywordInput("");

    // Exit edit mode
    setIsEditing(false);

    // Force a re-render for good measure
    forceUpdate();
  };

  // Loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <Main key={`loading-${renderKey}`}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Main>
    );
  }

  // Unauthorized state
  if (!isAuthenticated) {
    return (
      <Main key={`unauthenticated-${renderKey}`}>
        <div
          key="unauthenticated"
          className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
        >
          <UserIcon className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Authentication Required</h1>
          <p className="mb-6 max-w-md text-muted-foreground">
            You need to be logged in to view and edit your profile.
          </p>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </Main>
    );
  }

  return (
    <Main key={`authenticated-${renderKey}`}>
      <div
        key="authenticated"
        className="mx-auto max-w-3xl px-4 py-8 md:px-6 lg:px-8"
      >
        <div className="bg-card mb-6 rounded-lg p-6 shadow-sm">
          <h1 className="mb-6 font-primary text-2xl md:text-3xl">
            Hello,{" "}
            {isEditing ? formState.user.nickname : userAttributes.nickname}
          </h1>

          {/* Community Profile Indicator */}
          {community && !communityLoading && (
            <div className="border-primary/20 from-primary/5 to-primary/10 mb-6 rounded-xl border bg-gradient-to-r p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Your{" "}
                    <span className="font-semibold text-primary">
                      {community.displayName}
                    </span>{" "}
                    community profile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This profile is specific to the {community.displayName}{" "}
                    community
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open Clerk's user profile modal directly to our custom page
                    const event = new CustomEvent("clerk:openUserProfile", {
                      detail: { page: "community-profile" },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="shrink-0"
                >
                  Quick Edit
                </Button>
              </div>
            </div>
          )}

          {/* Grid layout: Image on left (md+), Details on right (md+) / Stacked on mobile */}
          <div className="grid gap-8 md:grid-cols-[200px_1fr]">
            {/* Profile image section - Using Clerk's Image */}
            <div className="flex flex-col items-center gap-4 md:order-1">
              <div className="h-40 w-40 overflow-hidden rounded-full bg-muted md:h-[200px] md:w-[200px]">
                {clerkUser?.imageUrl ? (
                  <img
                    src={clerkUser.imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 flex h-full w-full items-center justify-center text-primary">
                    <UserIcon className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Info about image management */}
              {isEditing && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Profile image is managed through your account settings
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Go to &quot;Account&quot; tab in the user menu to update
                    your photo
                  </p>
                </div>
              )}
            </div>

            {/* Profile details (Now second) */}
            <div className="space-y-6 md:order-2">
              {" "}
              {/* Explicit order for clarity */}
              {/* Nickname */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <UserIcon className="mr-2 inline h-4 w-4" />
                  Nickname
                </label>
                {isEditing ? (
                  <>
                    <div className="relative max-w-md">
                      {(() => {
                        let dynamicClasses = "";
                        if (isCheckingNickname) {
                          dynamicClasses = "border-muted-foreground/50";
                        } else if (isNicknameUnique === true) {
                          dynamicClasses =
                            "border-green-500 focus:border-green-500 focus-visible:ring-green-500/20";
                        } else if (isNicknameUnique === false) {
                          dynamicClasses =
                            "border-red-500 focus:border-red-500 focus-visible:ring-red-500/20";
                        }
                        return (
                          <Input
                            value={formState.user.nickname || ""}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                user: {
                                  ...prev.user,
                                  nickname: e.target.value,
                                },
                              }))
                            }
                            placeholder="Your name"
                            className={`pr-10 ${dynamicClasses}`}
                          />
                        );
                      })()}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isCheckingNickname ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isNicknameUnique === true ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isNicknameUnique === false ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-1 h-4 text-sm">
                      {isNicknameUnique === false && (
                        <p className="text-red-500">Nickname already taken</p>
                      )}
                      {nicknameCheckError && (
                        <p className="text-red-500">{nicknameCheckError}</p>
                      )}
                      {isCheckingNickname && (
                        <p className="text-muted-foreground">
                          Checking availability...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-lg font-medium">
                    {userAttributes.nickname || "No name set"}
                  </p>
                )}
              </div>
              {/* Bio */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <PenSquare className="mr-2 inline h-4 w-4" />
                  Bio
                </label>
                {isEditing ? (
                  <Textarea
                    value={formState.profile.bio || ""}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          bio: e.target.value,
                        },
                      }))
                    }
                    placeholder="Tell us about yourself"
                    className="max-w-md"
                    rows={4}
                  />
                ) : (
                  <p className="text-md">
                    {profileAttributes.bio || "No bio set"}
                  </p>
                )}
              </div>
              {/* Current Affiliation */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <Briefcase className="mr-2 inline h-4 w-4" />
                  Current Focus
                </label>
                {isEditing ? (
                  <Input
                    value={formState.profile.currentAffiliation || ""}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          currentAffiliation: e.target.value,
                        },
                      }))
                    }
                    placeholder="Current company, school, project or your plant?"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-md">
                    {profileAttributes.currentAffiliation ||
                      "No affiliation set"}
                  </p>
                )}
              </div>
              {/* URL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <Globe className="mr-2 inline h-4 w-4" />
                  Website
                </label>
                {isEditing ? (
                  <Input
                    value={formState.profile.url || ""}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          url: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://your-website.com"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-md">
                    {profileAttributes.url ? (
                      <a
                        href={profileAttributes.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-primary"
                      >
                        {profileAttributes.url} <LinkIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      "No website set"
                    )}
                  </p>
                )}
              </div>
              {/* Keywords */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <Tag className="mr-2 inline h-4 w-4" />
                  Keywords
                </label>

                {isEditing && (
                  <div className="mb-3 flex flex-col gap-2 sm:max-w-md sm:flex-row">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword"
                      className="flex-grow"
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addKeyword}
                    >
                      Add
                    </Button>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  {isEditing ? (
                    (formState.profile.keywords || []).length > 0 ? (
                      (formState.profile.keywords || []).map(
                        (keyword: string, index: number) => (
                          <div
                            key={index}
                            className={`
                              flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm
                              ${isEditing ? "pr-1" : ""}
                            `}
                          >
                            {keyword}
                            {isEditing && (
                              <button
                                onClick={() => removeKeyword(keyword)}
                                className="bg-muted-foreground/20 hover:bg-muted-foreground/30 ml-1 flex h-5 w-5 items-center justify-center rounded-full"
                              >
                                <span className="sr-only">Remove</span>
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                >
                                  <path
                                    d="M1.5 1.5L8.5 8.5M1.5 8.5L8.5 1.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No keywords set
                      </p>
                    )
                  ) : (profileAttributes.keywords || []).length > 0 ? (
                    (profileAttributes.keywords || []).map(
                      (keyword: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                        >
                          {keyword}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No keywords set
                    </p>
                  )}
                </div>
              </div>
              {/* Email (display only) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-md">
                  {fetchedUser?.email || "No email available"}
                </p>
              </div>
              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isUpdatingProfile ||
                      isUpdatingUser ||
                      isCheckingNickname ||
                      isNicknameUnique === false ||
                      !formState.user.nickname
                    }
                  >
                    {isUpdatingProfile || isUpdatingUser
                      ? "Updating..."
                      : "Save Profile"}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
};

export default ProfilePage;
