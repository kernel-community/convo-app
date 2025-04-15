"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const { fetchedUser, handleSignOut } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile data
  const { data: profile, isLoading: profileLoading } = useProfile({
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

  // Set profile data once loaded
  useEffect(() => {
    if (profile) {
      setProfileAttributes(profile);
    }
    if (fetchedUser) {
      setUserAttributes(pick(fetchedUser, ["nickname", "id"]));
      // Always ensure userId is set in profileAttributes
      setProfileAttributes((prev) => ({
        ...prev,
        userId: fetchedUser.id,
      }));
    }
  }, [profile, fetchedUser]);

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

    // Make sure userId is included in the profile data
    setProfileAttributes((prev) => ({
      ...prev,
      userId: fetchedUser?.id,
    }));

    await updateUser();
    // Call updateProfile without arguments, as it uses the updated profileAttributes state
    await updateProfile();
    setIsEditing(false);
    setIsLoading(false);
  };

  // Handle keyword addition
  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !profileAttributes.keywords?.includes(keywordInput.trim())
    ) {
      setProfileAttributes((prev: Partial<ProfileType>) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  // Handle keyword removal
  const removeKeyword = (keyword: string) => {
    setProfileAttributes((prev: Partial<ProfileType>) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k: string) => k !== keyword),
    }));
  };

  // Add state for sign out dialog
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  Cancel <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Edit Profile <PenSquare className="h-4 w-4" />
                </>
              )}
            </Button>
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
                    value={userAttributes.nickname || ""}
                    onChange={(e) =>
                      setUserAttributes({
                        ...userAttributes,
                        nickname: e.target.value,
                      })
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
                    value={profileAttributes.bio || ""}
                    onChange={(e) =>
                      setProfileAttributes({
                        ...profileAttributes,
                        bio: e.target.value,
                      })
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
                    value={profileAttributes.currentAffiliation || ""}
                    onChange={(e) =>
                      setProfileAttributes({
                        ...profileAttributes,
                        currentAffiliation: e.target.value,
                      })
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
                    value={profileAttributes.url || ""}
                    onChange={(e) =>
                      setProfileAttributes({
                        ...profileAttributes,
                        url: e.target.value,
                      })
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
                  {(profileAttributes.keywords || []).length > 0 ? (
                    (profileAttributes.keywords || []).map(
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
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                  currentImageUrl={profileAttributes.image || ""}
                  onUploadComplete={(imageUrl) => {
                    setProfileAttributes({
                      ...profileAttributes,
                      image: imageUrl,
                    });
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
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <UserIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSignOutDialogOpen(true)}
                  >
                    Sign Out
                  </Button>

                  <Credenza
                    open={isSignOutDialogOpen}
                    onOpenChange={(open) => {
                      setIsSignOutDialogOpen(open);
                      // If the dialog is closing without explicit sign out, update the render key
                      if (!open && !isSigningOut) {
                        forceUpdate();
                      }
                    }}
                  >
                    <CredenzaContent>
                      <CredenzaHeader>
                        <CredenzaTitle>Sign out of your account?</CredenzaTitle>
                        <CredenzaDescription>
                          You&apos;ll need to sign in again to access your
                          profile and other authenticated features.
                        </CredenzaDescription>
                      </CredenzaHeader>
                      <CredenzaBody>
                        <p className="text-sm text-muted-foreground">
                          Your session will be ended immediately.
                        </p>
                      </CredenzaBody>
                      <CredenzaFooter>
                        <Button
                          variant="destructive"
                          onClick={handleProfileSignOut}
                          disabled={isSigningOut}
                          className="mr-2"
                        >
                          {isSigningOut ? "Signing out..." : "Sign out"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsSignOutDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </CredenzaFooter>
                    </CredenzaContent>
                  </Credenza>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Main>
  );
};

export default ProfilePage;
