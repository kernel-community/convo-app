"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  PenSquare,
  User as UserIcon,
  Globe,
  Briefcase,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { pick } from "lodash";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaBody,
} from "src/components/ui/credenza";

import Main from "src/layouts/Main";
import { useUser } from "src/context/UserContext";
import useProfile from "src/hooks/useProfile";
import useUpdateProfile from "src/hooks/useUpdateProfile";
import useUpdateUser from "src/hooks/useUpdateUser";
import { checkSessionAuth } from "src/lib/checkSessionAuth";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import type { Profile as ProfileType, User } from "@prisma/client";
import { ImageUpload } from "src/components/ui/image-upload";
import { DEAULT_PROFILE_PICTURE } from "src/utils/constants";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // New form state to track all edits until submission
  const [formState, setFormState] = useState<{
    profile: Partial<ProfileType>;
    user: Partial<User>;
  }>({
    profile: {},
    user: {},
  });

  // Check if we should enter edit mode from URL params
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "true" && !isEditing && isAuthenticated) {
      // Initialize form state with current data
      setFormState({
        profile: {
          ...(profile || {}),
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

  // Single comprehensive effect for authentication tracking
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only perform the async check if we need to validate server-side
        if (fetchedUser?.isSignedIn) {
          const isServerAuthenticated = await checkSessionAuth();

          // If the server says we're not authenticated but the client thinks we are,
          // update the client state
          if (!isServerAuthenticated && fetchedUser.isSignedIn) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(isServerAuthenticated);
          }
        } else {
          // If fetchedUser says we're not signed in, trust that
          setIsAuthenticated(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    // Always set isAuthenticated based on fetchedUser immediately
    setIsAuthenticated(!!fetchedUser?.isSignedIn);

    // Then verify with the server
    checkAuth();
  }, [fetchedUser]); // Only depend on fetchedUser

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
            ...(profile || {}),
            userId: fetchedUser?.id,
          },
          user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
        });
      }
    }
  }, [profile, fetchedUser, isEditing]);

  // Handle sign out with improved state management
  const handleProfileSignOut = async () => {
    // Start loading state
    setIsSigningOut(true);

    // Force immediate UI update before async operations
    setIsAuthenticated(false);
    forceUpdate(); // Force re-render immediately

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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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

    // Reset form state to match current profile and user data
    setFormState({
      profile: profile || {},
      user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
    });

    // Reset keyword input
    setKeywordInput("");

    // Exit edit mode
    setIsEditing(false);

    // Force a re-render for good measure
    forceUpdate();
  };

  // Add a function to handle entering edit mode
  const handleEnterEditMode = () => {
    // Initialize form state with current data
    setFormState({
      profile: {
        ...(profile || {}),
        userId: fetchedUser?.id,
      },
      user: fetchedUser ? pick(fetchedUser, ["nickname", "id"]) : {},
    });

    // Set edit mode
    setIsEditing(true);

    // Add the edit=true parameter to URL if it's not already there
    if (searchParams.get("edit") !== "true") {
      router.replace("/profile?edit=true");
    }
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
      <div key="authenticated" className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-card mb-6 rounded-lg p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-primary text-2xl">
              Hello,{" "}
              {isEditing ? formState.user.nickname : userAttributes.nickname} :)
            </h1>
            {!isEditing && (
              <Button
                onClick={handleEnterEditMode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <PenSquare className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_200px]">
            {/* Profile details */}
            <div className="space-y-6">
              {/* Nickname */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <UserIcon className="mr-2 inline h-4 w-4" />
                  Name
                </label>
                {isEditing ? (
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
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-lg font-medium">
                    {userAttributes.nickname || "No name set"}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  <UserIcon className="mr-2 inline h-4 w-4" />
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
                  Current Affiliation
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
                    placeholder="Where do you work or study?"
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
                        className="flex items-center gap-1 text-primary"
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
                  <div className="mb-3 flex max-w-md gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword"
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
                    disabled={isUpdatingProfile || isUpdatingUser}
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

            {/* Profile image */}
            <div className="flex flex-col items-center gap-4">
              {isEditing ? (
                <ImageUpload
                  userId={fetchedUser?.id || ""}
                  currentImageUrl={
                    formState.profile.image || profileAttributes.image || ""
                  }
                  onUploadComplete={(imageUrl) => {
                    setFormState((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        image: imageUrl,
                      },
                    }));
                  }}
                  size="lg"
                />
              ) : (
                <div className="w-full overflow-hidden rounded-full bg-muted">
                  {profileAttributes.image ? (
                    <img
                      src={profileAttributes.image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={DEAULT_PROFILE_PICTURE}
                      alt="Default Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
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
