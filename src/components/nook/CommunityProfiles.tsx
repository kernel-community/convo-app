"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Users,
  MapPin,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { cn } from "src/lib/utils";
import { useDebounce } from "src/hooks/useDebounce";
import { useInfiniteScroll } from "src/hooks/useInfiniteScroll";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { UserImage } from "../ui/default-user-image";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from "../ui/credenza";

interface CommunityProfile {
  userId: string;
  nickname: string;
  bio?: string;
  isCoreMember: boolean;
  totalResonances: number;
  lastResonance?: string;
  keywords: string[];
  currentAffiliation?: string;
  city?: string;
  url?: string;
  socialHandle?: string;
  project?: string;
  projectDescription?: string;
  image?: string; // Clerk profile image URL
  updatedAt: string;
}

interface CommunityProfilesResponse {
  success: boolean;
  data: {
    profiles: CommunityProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    community: {
      id: string;
      displayName: string;
    };
    search: string | null;
  };
  error?: string;
}

export interface CommunityProfilesProps {
  className?: string;
}

const ProfileCard: React.FC<{
  profile: CommunityProfile;
  onProfileClick: (profile: CommunityProfile) => void;
}> = ({ profile, onProfileClick }) => {
  const getActivityColor = (resonances: number) => {
    if (resonances >= 10) return "bg-emerald-500";
    if (resonances >= 5) return "bg-green-500";
    if (resonances >= 1) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const formatLastActive = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card
        className="flex h-[280px] cursor-pointer flex-col p-4 transition-all hover:shadow-md"
        onClick={() => onProfileClick(profile)}
      >
        {/* Header with avatar and name */}
        <div className="mb-4 flex items-start space-x-3">
          <UserImage
            userId={profile.userId}
            photo={profile.image}
            size="md"
            className="h-12 w-12 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate text-base font-medium">
                {profile.nickname}
              </h3>
              {profile.isCoreMember && (
                <Badge
                  variant="secondary"
                  className="flex-shrink-0 bg-purple-100 text-xs text-purple-800"
                >
                  Fellow
                </Badge>
              )}
            </div>

            {/* Activity info */}
            <div className="mb-1 flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{profile.totalResonances}</span>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getActivityColor(profile.totalResonances)
                  )}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Active {formatLastActive(profile.updatedAt)}
            </p>
          </div>
        </div>

        {/* Content sections - vertically stacked, flex-1 to fill remaining space */}
        <div className="flex-1 space-y-3 overflow-hidden">
          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Location */}
          {profile.city && (
            <div className="flex items-center space-x-1 text-sm">
              <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="truncate text-muted-foreground">
                {profile.city}
              </span>
            </div>
          )}

          {/* Website */}
          {profile.url && (
            <div className="text-xs">
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 truncate text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span>Website</span>
              </a>
            </div>
          )}
        </div>

        {/* Click indicator - pushed to bottom */}
        <div className="mt-auto border-t pt-3">
          <p className="text-xs text-muted-foreground">Click to view details</p>
        </div>
      </Card>
    </motion.div>
  );
};

const ProfileModal: React.FC<{
  profile: CommunityProfile | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ profile, isOpen, onClose }) => {
  if (!profile) return null;

  const formatLastActive = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent className="max-h-[85vh] max-w-2xl">
        <CredenzaHeader className="text-left">
          <div className="flex items-start space-x-4">
            <UserImage
              userId={profile.userId}
              photo={profile.image}
              size="lg"
              className="h-16 w-16"
            />
            <div className="flex-1">
              <div className="mb-2 flex items-center space-x-2">
                <CredenzaTitle className="text-xl">
                  {profile.nickname}
                </CredenzaTitle>
                {profile.isCoreMember && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    Fellow
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{profile.totalResonances} resonances</span>
                <span>•</span>
                <span>Active {formatLastActive(profile.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CredenzaHeader>

        <CredenzaBody className="max-h-[60vh] space-y-6 overflow-y-auto">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="mb-2 font-medium">About</h3>
              <p className="leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Location and Affiliation */}
          {(profile.city || profile.currentAffiliation) && (
            <div>
              <h3 className="mb-2 font-medium">Location & Affiliation</h3>
              <div className="space-y-2">
                {profile.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile.currentAffiliation && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.currentAffiliation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project */}
          {profile.project && (
            <div>
              <h3 className="mb-2 font-medium">Current Project</h3>
              <div className="space-y-2">
                <p className="font-medium">{profile.project}</p>
                {profile.projectDescription && (
                  <p className="leading-relaxed text-muted-foreground">
                    {profile.projectDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {profile.keywords.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">Interests & Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {profile.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(profile.url || profile.socialHandle) && (
            <div>
              <h3 className="mb-2 font-medium">Links</h3>
              <div className="space-y-2">
                {profile.url && (
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Personal Website</span>
                  </a>
                )}
                {profile.socialHandle && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>Social: @{profile.socialHandle}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="h-[280px]">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex space-x-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const CommunityProfiles: React.FC<CommunityProfilesProps> = ({
  className,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [community, setCommunity] = useState<{
    id: string;
    displayName: string;
  } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] =
    useState<CommunityProfile | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get profile ID from URL search params
  const profileId = searchParams.get("profile");
  const isModalOpen = !!profileId;

  const fetchProfiles = useCallback(
    async (page: number) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (debouncedSearchTerm.trim()) {
        params.append("search", debouncedSearchTerm.trim());
      }

      const response = await fetch(`/api/nook/community-profiles?${params}`);
      const result: CommunityProfilesResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch profiles");
      }

      if (page === 1) {
        setCommunity(result.data.community);
        setTotalCount(result.data.pagination.totalCount);
      }

      return {
        data: result.data.profiles,
        hasMore: result.data.pagination.hasNextPage,
      };
    },
    [debouncedSearchTerm]
  );

  const {
    data: profiles,
    loading,
    error,
    hasMore,
    reset,
    setLoadingRef,
  } = useInfiniteScroll({
    fetchMore: fetchProfiles,
    initialPage: 1,
    threshold: 200,
  });

  // Reset when search term changes
  useEffect(() => {
    setInitialLoading(true);
    reset();
    // Small delay to ensure reset completes
    setTimeout(() => setInitialLoading(false), 100);
  }, [debouncedSearchTerm, reset]);

  const displayedProfiles = useMemo(() => {
    return profiles as CommunityProfile[];
  }, [profiles]);

  const handleProfileClick = (profile: CommunityProfile) => {
    const params = new URLSearchParams(searchParams);
    params.set("profile", profile.userId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleModalClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("profile");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Effect to find and set selected profile based on URL param
  useEffect(() => {
    if (profileId && displayedProfiles.length > 0) {
      const profile = displayedProfiles.find((p) => p.userId === profileId);
      setSelectedProfile(profile || null);
    } else {
      setSelectedProfile(null);
    }
  }, [profileId, displayedProfiles]);

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="py-12 text-center">
          <div className="mb-4 text-red-500">
            <Users className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm">Failed to load community profiles</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Community Profiles</h2>
            {community && (
              <p className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? "member" : "members"} in{" "}
                {community.displayName}
                {debouncedSearchTerm &&
                  ` • Searching for "${debouncedSearchTerm}"`}
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      {initialLoading || (loading && displayedProfiles.length === 0) ? (
        <LoadingSkeleton />
      ) : displayedProfiles.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {debouncedSearchTerm
              ? `No profiles found matching "${debouncedSearchTerm}"`
              : "No profiles found"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedProfiles.map((profile) => (
              <ProfileCard
                key={profile.userId}
                profile={profile}
                onProfileClick={handleProfileClick}
              />
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <div ref={setLoadingRef} className="flex justify-center py-4">
              {loading && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm">Loading more profiles...</span>
                </div>
              )}
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && displayedProfiles.length > 0 && (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                That&apos;s all {displayedProfiles.length}{" "}
                {displayedProfiles.length === 1 ? "profile" : "profiles"}!
              </p>
            </div>
          )}
        </div>
      )}

      <ProfileModal
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};
