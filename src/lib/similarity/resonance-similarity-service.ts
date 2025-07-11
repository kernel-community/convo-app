import { prisma } from "src/utils/db";
import { ResonanceSimilarityCalculator } from "./resonance-calculator";
import type {
  ResonanceEntry,
  UserResonanceAnalysis,
  SimilarProfileResult,
} from "./resonance-types";

interface CachedSimilarityResult {
  userId: string;
  communityId: string;
  similarProfiles: SimilarProfileResult[];
  calculatedAt: Date;
  profilesVersion: string; // Hash of all profile data to detect changes
}

interface CommunityProfilesCache {
  communityId: string;
  profiles: any[];
  userAnalyses: UserResonanceAnalysis[];
  lastUpdated: Date;
  profilesHash: string;
}

export class ResonanceSimilarityService {
  private calculator: ResonanceSimilarityCalculator;
  private similarityCache = new Map<string, CachedSimilarityResult>();
  private communityCache = new Map<string, CommunityProfilesCache>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
  private readonly COMMUNITY_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

  constructor() {
    this.calculator = new ResonanceSimilarityCalculator();
  }

  /**
   * Generate a hash of profile data to detect changes
   */
  private generateProfilesHash(profiles: any[]): string {
    const hashData = profiles.map((p) => ({
      userId: p.userId,
      bio: p.bio,
      resonanceCount: (p.resonance as ResonanceEntry[])?.length || 0,
      lastResonance: (p.resonance as ResonanceEntry[])?.[0]?.timestamp || null,
    }));

    return JSON.stringify(hashData);
  }

  /**
   * Get cached community data or fetch fresh data
   */
  private async getCommunityData(
    communityId: string
  ): Promise<CommunityProfilesCache> {
    const cached = this.communityCache.get(communityId);

    // Check if cache is still valid
    if (
      cached &&
      Date.now() - cached.lastUpdated.getTime() < this.COMMUNITY_CACHE_TTL_MS
    ) {
      console.log(`Using cached community data for ${communityId}`);
      return cached;
    }

    console.log(`Fetching fresh community data for ${communityId}`);

    // Fetch fresh data - get all profiles and filter in code for better compatibility
    const allProfiles = await prisma.profile.findMany({
      where: {
        communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    // Filter profiles that have either non-empty resonance array or non-null bio
    const profiles = allProfiles.filter((profile) => {
      const resonanceArray = profile.resonance as unknown as ResonanceEntry[];
      const hasResonance =
        resonanceArray &&
        Array.isArray(resonanceArray) &&
        resonanceArray.length > 0;
      const hasBio = profile.bio && profile.bio.trim().length > 0;
      return hasResonance || hasBio;
    });

    // Preprocess all profiles into analysis format
    const userAnalyses: UserResonanceAnalysis[] = profiles.map((profile) => {
      const resonanceEntries =
        (profile.resonance as unknown as ResonanceEntry[]) || [];
      return this.calculator.preprocessUserData(
        profile.userId,
        profile.bio || "",
        resonanceEntries
      );
    });

    const profilesHash = this.generateProfilesHash(profiles);

    const communityData: CommunityProfilesCache = {
      communityId,
      profiles,
      userAnalyses,
      lastUpdated: new Date(),
      profilesHash,
    };

    // Update cache
    this.communityCache.set(communityId, communityData);

    // Clean up old cache entries (keep only last 5 communities)
    if (this.communityCache.size > 5) {
      const oldestEntry = Array.from(this.communityCache.entries()).sort(
        ([, a], [, b]) => a.lastUpdated.getTime() - b.lastUpdated.getTime()
      )[0];
      if (oldestEntry) {
        this.communityCache.delete(oldestEntry[0]);
      }
    }

    return communityData;
  }

  /**
   * Get similar profiles with caching
   */
  async getSimilarProfiles(
    userId: string,
    communityId: string,
    maxResults = 6
  ): Promise<{
    similarProfiles: SimilarProfileResult[];
    fromCache: boolean;
    calculationTime: number;
  }> {
    const startTime = Date.now();
    const cacheKey = `${userId}-${communityId}`;

    // Check cache first
    const cached = this.similarityCache.get(cacheKey);
    const communityData = await this.getCommunityData(communityId);

    // Validate cache
    const isCacheValid =
      cached &&
      Date.now() - cached.calculatedAt.getTime() < this.CACHE_TTL_MS &&
      cached.profilesVersion === communityData.profilesHash;

    if (isCacheValid && cached) {
      console.log(`Using cached similarity results for user ${userId}`);
      return {
        similarProfiles: cached.similarProfiles.slice(0, maxResults),
        fromCache: true,
        calculationTime: Date.now() - startTime,
      };
    }

    console.log(`Calculating fresh similarity results for user ${userId}`);

    // Find current user's analysis
    const currentUserAnalysis = communityData.userAnalyses.find(
      (u) => u.id === userId
    );

    if (!currentUserAnalysis) {
      throw new Error(`User ${userId} not found in community ${communityId}`);
    }

    // Calculate similarities
    const similarProfiles = this.calculator.findMostSimilarProfiles(
      currentUserAnalysis,
      communityData.userAnalyses,
      Math.max(maxResults, 10) // Calculate a few extra for cache
    );

    // Enhance with user information
    const enhancedResults: SimilarProfileResult[] = similarProfiles.map(
      (result) => {
        const profile = communityData.profiles.find(
          (p) => p.userId === result.userId
        );
        if (!profile) {
          throw new Error(`Profile not found for user ${result.userId}`);
        }

        return {
          ...result,
          profile: {
            ...result.profile,
            nickname: profile.user.nickname,
            bio: profile.bio || undefined,
          },
        };
      }
    );

    // Cache the results
    const cacheEntry: CachedSimilarityResult = {
      userId,
      communityId,
      similarProfiles: enhancedResults,
      calculatedAt: new Date(),
      profilesVersion: communityData.profilesHash,
    };

    this.similarityCache.set(cacheKey, cacheEntry);

    // Clean up old cache entries (keep only last 100 users)
    if (this.similarityCache.size > 100) {
      const oldestEntry = Array.from(this.similarityCache.entries()).sort(
        ([, a], [, b]) => a.calculatedAt.getTime() - b.calculatedAt.getTime()
      )[0];
      if (oldestEntry) {
        this.similarityCache.delete(oldestEntry[0]);
      }
    }

    const calculationTime = Date.now() - startTime;
    console.log(
      `Similarity calculation completed in ${calculationTime}ms for ${communityData.userAnalyses.length} profiles`
    );

    return {
      similarProfiles: enhancedResults.slice(0, maxResults),
      fromCache: false,
      calculationTime,
    };
  }

  /**
   * Invalidate cache for a specific user (call when they add new resonance)
   */
  invalidateUserCache(userId: string, communityId: string): void {
    const cacheKey = `${userId}-${communityId}`;
    this.similarityCache.delete(cacheKey);

    // Also invalidate community cache to trigger fresh data fetch
    this.communityCache.delete(communityId);

    console.log(
      `Invalidated cache for user ${userId} in community ${communityId}`
    );
  }

  /**
   * Invalidate entire community cache (call when profiles are updated)
   */
  invalidateCommunityCache(communityId: string): void {
    this.communityCache.delete(communityId);

    // Remove all cached similarities for this community
    const keysToDelete = Array.from(this.similarityCache.keys()).filter((key) =>
      key.endsWith(`-${communityId}`)
    );

    keysToDelete.forEach((key) => this.similarityCache.delete(key));

    console.log(`Invalidated entire cache for community ${communityId}`);
  }

  /**
   * Warm up cache for a community's most active users
   */
  async warmUpCache(communityId: string, topUsersCount = 10): Promise<void> {
    console.log(`Warming up cache for community ${communityId}`);

    const communityData = await this.getCommunityData(communityId);

    // Sort users by activity (resonance count + bio presence)
    const activeUsers = communityData.userAnalyses
      .map((user) => ({
        ...user,
        activityScore: user.totalResonanceCount + (user.bio ? 5 : 0),
      }))
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, topUsersCount);

    // Calculate similarities for top users
    const warmUpPromises = activeUsers.map((user) =>
      this.getSimilarProfiles(user.id, communityId, 6).catch((error) => {
        console.error(`Failed to warm up cache for user ${user.id}:`, error);
      })
    );

    await Promise.all(warmUpPromises);
    console.log(
      `Cache warmed up for ${activeUsers.length} users in community ${communityId}`
    );
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    similarityCacheSize: number;
    communityCacheSize: number;
    cacheHitRate?: number;
  } {
    return {
      similarityCacheSize: this.similarityCache.size,
      communityCacheSize: this.communityCache.size,
    };
  }
}
