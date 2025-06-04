"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Globe,
  Briefcase,
  Tag,
  Loader2,
  Check,
  X,
  PenSquare,
  Save,
  AlertCircle,
} from "lucide-react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { pick } from "lodash";

import { useUser } from "src/context/UserContext";
import useProfile from "src/hooks/useProfile";
import useUpdateProfile from "src/hooks/useUpdateProfile";
import useUpdateUser from "src/hooks/useUpdateUser";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import type { Profile as ProfileType, User } from "@prisma/client";
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
    className={`min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ${
      className || ""
    }`}
    rows={rows}
  />
);

export const CommunityProfilePage = () => {
  const { fetchedUser, setFetchedUser } = useUser();
  const { isSignedIn, isLoaded, user: clerkUser } = useClerkUser();
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

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

  const { fetch: updateProfile, isLoading: isUpdatingProfile } =
    useUpdateProfile({});
  const { fetch: updateUser, isLoading: isUpdatingUser } = useUpdateUser({});

  // Form state to track all edits (excluding image and nickname since we use Clerk's)
  const [formState, setFormState] = useState<{
    profile: Partial<Omit<ProfileType, "image">>;
    user: Partial<Omit<User, "nickname">>;
  }>({
    profile: {},
    user: {},
  });

  // Initialize form state when profile loads (excluding nickname)
  useEffect(() => {
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
        user: fetchedUser ? pick(fetchedUser, ["id"]) : {},
      });
    }
  }, [profile, fetchedUser]);

  // Handle profile submit (no longer updates nickname)
  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Only update profile data since nickname is managed by Clerk
      const profileData = {
        ...formState.profile,
        userId: fetchedUser?.id,
      };

      await updateProfile(profileData);

      // Refetch the profile data to ensure we have the latest data
      await refetchProfile();

      setSaveStatus("success");

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaveStatus("error");

      // Auto-hide error message after 5 seconds
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setIsSaving(false);
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

  // Loading state
  if (!isLoaded || !isSignedIn || profileLoading || communityLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Community Info Header */}
      {community && (
        <div className="bg-primary/5 rounded-lg border p-4">
          <h2 className="font-semibold text-foreground">
            Your {community.displayName} Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            This profile is specific to the {community.displayName} community
          </p>
        </div>
      )}

      {/* Profile Management Notice */}
      <div className="bg-muted/30 rounded-md border border-muted p-3">
        <div className="flex items-center gap-3">
          {/* Profile Image */}
          <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-primary/10 flex h-full w-full items-center justify-center text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {clerkUser?.fullName || clerkUser?.firstName || "No name set"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {clerkUser?.primaryEmailAddress?.emailAddress || "No email"}
            </p>
          </div>

          {/* Note */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Managed in &quot;Profile&quot; tab
            </p>
          </div>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">
            Profile saved successfully!
          </span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Failed to save profile. Please try again.
          </span>
        </div>
      )}

      {/* <div className="grid gap-6 md:grid-cols-[200px_1fr]"> */}
      {/* Profile Details */}
      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            <PenSquare className="mr-2 inline h-4 w-4" />
            Bio
          </label>
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
            rows={4}
          />
        </div>

        {/* Current Affiliation */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            <Briefcase className="mr-2 inline h-4 w-4" />
            Current Focus
          </label>
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
          />
        </div>

        {/* URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            <Globe className="mr-2 inline h-4 w-4" />
            Website
          </label>
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
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            <Tag className="mr-2 inline h-4 w-4" />
            Keywords
          </label>

          <div className="mb-3 flex gap-2">
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
            <Button type="button" variant="outline" onClick={addKeyword}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(formState.profile.keywords || []).length > 0 ? (
              (formState.profile.keywords || []).map(
                (keyword: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="bg-muted-foreground/20 hover:bg-muted-foreground/30 ml-1 flex h-5 w-5 items-center justify-center rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-muted-foreground">No keywords set</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={
              isSaving ||
              isUpdatingProfile ||
              isUpdatingUser ||
              !formState.user.id
            }
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};
