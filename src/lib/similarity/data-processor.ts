import { prisma } from "src/utils/db";
import type { UserProfileAnalysis } from "./types";

export class SimilarityDataProcessor {
  /**
   * Extract and analyze user profile data from the database
   */
  async extractUserProfileData(): Promise<UserProfileAnalysis[]> {
    // Fetch all users with their profiles only (no event data needed)
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    // Transform users into UserProfileAnalysis format
    const userAnalyses: UserProfileAnalysis[] = [];

    for (const user of users) {
      const analysis: UserProfileAnalysis = {
        id: user.id,
        keywords: user.profile?.keywords || [],
        bio: user.profile?.bio || "",
        affiliation: user.profile?.currentAffiliation || "",
      };

      userAnalyses.push(analysis);
    }

    return userAnalyses;
  }

  /**
   * Extract event patterns and timing data for users
   */
  async extractEventPatterns(userId: string): Promise<{
    eventTypes: string[];
    timing: Date[];
    frequency: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rsvps: {
          include: {
            event: {
              select: {
                type: true,
                startDateTime: true,
              },
            },
          },
          where: {
            rsvpType: "GOING",
            event: {
              isDeleted: false,
            },
          },
        },
        proposedEvents: {
          include: {
            event: {
              select: {
                type: true,
                startDateTime: true,
              },
            },
          },
          where: {
            event: {
              isDeleted: false,
            },
          },
        },
      },
    });

    if (!user) {
      return { eventTypes: [], timing: [], frequency: 0 };
    }

    const eventTypes: string[] = [];
    const timing: Date[] = [];

    // Collect data from RSVPs
    user.rsvps.forEach((rsvp) => {
      if (rsvp.event) {
        eventTypes.push(rsvp.event.type);
        timing.push(rsvp.event.startDateTime);
      }
    });

    // Collect data from proposed events
    user.proposedEvents.forEach((proposedEvent) => {
      if (proposedEvent.event) {
        eventTypes.push(proposedEvent.event.type);
        timing.push(proposedEvent.event.startDateTime);
      }
    });

    return {
      eventTypes,
      timing,
      frequency: eventTypes.length,
    };
  }

  /**
   * Extract enhanced user data with temporal patterns
   */
  async extractEnhancedUserData(userId: string): Promise<{
    profile: UserProfileAnalysis;
    temporalPatterns: {
      mostActiveTimeOfDay: number; // Hour of day
      mostActiveDay: number; // Day of week
      eventFrequency: number; // Events per month
    };
    socialPatterns: {
      averageConnectionWeight: number;
      connectionDistribution: { [weight: number]: number };
      networkPosition: "central" | "peripheral" | "bridge";
    };
  }> {
    // This would be implemented for more advanced similarity calculations
    // For now, return basic structure
    const profile = (await this.extractUserProfileData()).find(
      (p) => p.id === userId
    );

    if (!profile) {
      throw new Error(`User ${userId} not found`);
    }

    return {
      profile,
      temporalPatterns: {
        mostActiveTimeOfDay: 14, // 2 PM default
        mostActiveDay: 1, // Monday default
        eventFrequency: 2, // 2 events per month default
      },
      socialPatterns: {
        averageConnectionWeight: 5,
        connectionDistribution: {},
        networkPosition: "peripheral",
      },
    };
  }
}
