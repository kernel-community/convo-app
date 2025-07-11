"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { UserImage } from "../ui/default-user-image";

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

const ProfileCard: React.FC<{ profile: CommunityProfile }> = ({ profile }) => {
  const [showDetails, setShowDetails] = useState(false);

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
        className="h-full cursor-pointer transition-all hover:shadow-md"
        onClick={() => setShowDetails(!showDetails)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3">
            <UserImage
              userId={profile.userId}
              size="md"
              className="h-12 w-12 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <CardTitle className="truncate text-base font-medium">
                  {profile.nickname}
                </CardTitle>
                {profile.isCoreMember && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-xs text-purple-800"
                  >
                    Fellow
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{profile.totalResonances} resonances</span>
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      getActivityColor(profile.totalResonances)
                    )}
                  />
                </div>
                <span>•</span>
                <span>Active {formatLastActive(profile.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Bio */}
          {profile.bio && (
            <div className="text-sm text-muted-foreground">
              <p
                className={cn(
                  "leading-relaxed",
                  showDetails ? "" : "line-clamp-2"
                )}
              >
                {profile.bio}
              </p>
            </div>
          )}

          {/* Location and Affiliation */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {profile.city && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{profile.city}</span>
              </div>
            )}
            {profile.currentAffiliation && (
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span className="truncate">{profile.currentAffiliation}</span>
              </div>
            )}
          </div>

          {/* Project */}
          {profile.project && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">
                Project:
              </span>
              <p className="mt-1 text-sm">{profile.project}</p>
              {showDetails && profile.projectDescription && (
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {profile.projectDescription}
                </p>
              )}
            </div>
          )}

          {/* Keywords */}
          {profile.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.keywords
                .slice(0, showDetails ? profile.keywords.length : 3)
                .map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              {!showDetails && profile.keywords.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  +{profile.keywords.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Links */}
          {(profile.url || profile.socialHandle) && (
            <div className="flex items-center space-x-2 text-xs">
              {profile.url && (
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Website</span>
                </a>
              )}
              {profile.socialHandle && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <span>@{profile.socialHandle}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-2 text-center text-xs text-muted-foreground">
            {showDetails ? "Click to collapse" : "Click to see more"}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [community, setCommunity] = useState<{
    id: string;
    displayName: string;
  } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
              <ProfileCard key={profile.userId} profile={profile} />
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
    </div>
  );
};
