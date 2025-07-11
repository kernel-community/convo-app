"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "src/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { UserImage } from "../ui/default-user-image";
import type {
  SimilarProfileResult,
  ResonanceEntry,
} from "src/lib/similarity/resonance-types";

interface SimilarProfilesResponse {
  success: boolean;
  message: string;
  data: {
    similarProfiles: SimilarProfileResult[];
    currentUser: {
      id: string;
      nickname: string;
      totalResonances: number;
      bio?: string;
    };
    community: {
      id: string;
      displayName: string;
      totalProfiles: number;
    };
  };
}

export interface SimilarProfilesProps {
  className?: string;
}

const ProfileCard: React.FC<{ profile: SimilarProfileResult }> = ({
  profile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEnergyColor = (energy: number) => {
    if (energy <= 30) return "text-blue-500";
    if (energy <= 60) return "text-green-500";
    if (energy <= 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy <= 20) return "😊";
    if (energy <= 50) return "😃";
    if (energy <= 80) return "💃";
    return "⚡";
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-green-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="h-full cursor-pointer transition-all hover:shadow-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <UserImage
              userId={profile.userId}
              size="md"
              className="h-10 w-10"
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-sm font-medium">
                {profile.profile.nickname}
              </CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    getSimilarityColor(profile.similarityScore)
                  )}
                >
                  {profile.similarityScore}/10 match
                </Badge>
                <span
                  className={cn(
                    "text-xs",
                    getEnergyColor(profile.profile.averageEnergy)
                  )}
                >
                  {getEnergyEmoji(profile.profile.averageEnergy)}{" "}
                  {Math.round(profile.profile.averageEnergy)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Weather moods */}
          {profile.profile.commonWeatherMoods.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">
                Shared moods:
              </span>
              <div className="flex space-x-1">
                {profile.profile.commonWeatherMoods.map((weather, index) => (
                  <span key={index} className="text-sm">
                    {weather}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio preview */}
          {profile.profile.bio && (
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {profile.profile.bio}
            </div>
          )}

          {/* Recent resonances preview */}
          {profile.profile.recentResonances.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Recent resonances:
              </span>
              <div className="space-y-1">
                {profile.profile.recentResonances
                  .slice(0, isExpanded ? 3 : 1)
                  .map((resonance, index) => (
                    <div
                      key={index}
                      className="rounded bg-muted p-2 text-xs text-muted-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-2 flex-1">
                          {resonance.text}
                        </span>
                        {resonance.weather && (
                          <span className="ml-2">{resonance.weather}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Similarity explanation */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t pt-3"
              >
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Why you&apos;re similar:</span>
                  <p className="mt-1 leading-relaxed">{profile.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center text-xs text-muted-foreground">
            {isExpanded
              ? "Click to collapse"
              : "Click to see why you&apos;re similar"}
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
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const SimilarProfiles: React.FC<SimilarProfilesProps> = ({
  className,
}) => {
  const [data, setData] = useState<SimilarProfilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/nook/similar-profiles");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch similar profiles");
        }

        setData(result);
      } catch (err) {
        console.error("Error fetching similar profiles:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProfiles();
  }, []);

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-6 text-center">
          <h2 className="mb-2 font-brand text-2xl font-bold">Similar Minds</h2>
          <p className="text-muted-foreground">
            Finding your resonance matches...
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full text-center", className)}>
        <div className="rounded-lg bg-muted p-8">
          <h2 className="mb-2 font-brand text-2xl font-bold">Similar Minds</h2>
          <p className="mb-4 text-muted-foreground">
            Unable to find similar profiles right now
          </p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data?.data?.similarProfiles?.length) {
    return (
      <div className={cn("w-full text-center", className)}>
        <div className="rounded-lg bg-muted p-8">
          <h2 className="mb-2 font-brand text-2xl font-bold">Similar Minds</h2>
          <p className="mb-4 text-muted-foreground">
            No similar profiles found yet
          </p>
          <p className="text-sm text-muted-foreground">
            Share more resonances and complete your bio to find your matches!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 text-center">
          <h2 className="mb-2 font-brand text-2xl font-bold">Similar Minds</h2>
          <p className="text-muted-foreground">
            Found {data.data.similarProfiles.length} profiles that resonate with
            you in{" "}
            <span className="font-medium">
              {data.data.community.displayName}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.similarProfiles.map((profile, index) => (
            <motion.div
              key={profile.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProfileCard profile={profile} />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Similarity based on resonance content, bio, weather patterns, and
            energy levels
          </p>
        </div>
      </motion.div>
    </div>
  );
};
