import type {
  ResonanceEntry,
  ResonanceSimilarityFactors,
  ResonanceSimilarityWeights,
  UserResonanceAnalysis,
  ResonanceSimilarityScore,
  SimilarProfileResult,
} from "./resonance-types";
import { DEFAULT_RESONANCE_SIMILARITY_WEIGHTS } from "./resonance-types";

export class ResonanceSimilarityCalculator {
  private weights: ResonanceSimilarityWeights;

  constructor(
    weights: ResonanceSimilarityWeights = DEFAULT_RESONANCE_SIMILARITY_WEIGHTS
  ) {
    this.weights = weights;
  }

  /**
   * Pre-process user data into analysis format for efficient comparison
   */
  preprocessUserData(
    userId: string,
    bio: string,
    resonanceEntries: ResonanceEntry[]
  ): UserResonanceAnalysis {
    // Calculate average energy
    const energies = resonanceEntries
      .map((r) => r.energy)
      .filter((e) => e !== undefined);
    const averageEnergy =
      energies.length > 0
        ? energies.reduce((a, b) => a + b, 0) / energies.length
        : 50;

    // Calculate weather frequency
    const weatherFrequency: Record<string, number> = {};
    resonanceEntries.forEach((entry) => {
      if (entry.weather) {
        weatherFrequency[entry.weather] =
          (weatherFrequency[entry.weather] || 0) + 1;
      }
    });

    // Get recent resonance texts (last 10, most recent first)
    const sortedEntries = resonanceEntries
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const recentResonanceTexts = sortedEntries.map((entry) => entry.text);

    return {
      id: userId,
      bio: bio || "",
      resonanceEntries,
      averageEnergy,
      weatherFrequency,
      recentResonanceTexts,
      totalResonanceCount: resonanceEntries.length,
    };
  }

  /**
   * Calculate semantic similarity between texts using token overlap and TF-IDF principles
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const tokenize = (text: string): string[] => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .filter(
          (word) =>
            ![
              "the",
              "and",
              "for",
              "are",
              "but",
              "not",
              "you",
              "all",
              "can",
              "had",
              "her",
              "was",
              "one",
              "our",
              "out",
              "day",
              "get",
              "has",
              "him",
              "his",
              "how",
              "its",
              "may",
              "new",
              "now",
              "old",
              "see",
              "two",
              "who",
              "boy",
              "did",
              "man",
              "men",
              "put",
              "say",
              "she",
              "too",
              "use",
              "this",
              "that",
              "with",
              "have",
              "will",
              "been",
              "from",
              "they",
              "know",
              "want",
              "way",
            ].includes(word)
        );
    };

    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    if (tokens1.length === 0 && tokens2.length === 0) return 1;
    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    // Basic Jaccard similarity with length bonus for longer meaningful content
    const jaccardSimilarity = intersection.size / union.size;

    // Bonus for having substantial content (more than just 1-2 words)
    const lengthBonus = Math.min(tokens1.length, tokens2.length) > 3 ? 0.1 : 0;

    return Math.min(1, jaccardSimilarity + lengthBonus);
  }

  /**
   * Calculate similarity between resonance texts
   */
  private calculateResonanceTextSimilarity(
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): number {
    const texts1 = user1.recentResonanceTexts;
    const texts2 = user2.recentResonanceTexts;

    if (texts1.length === 0 && texts2.length === 0) return 1;
    if (texts1.length === 0 || texts2.length === 0) return 0;

    // Compare all combinations and take the average of top similarities
    const similarities: number[] = [];

    for (const text1 of texts1) {
      for (const text2 of texts2) {
        similarities.push(this.calculateTextSimilarity(text1, text2));
      }
    }

    // Take average of top 30% similarities to focus on the best matches
    similarities.sort((a, b) => b - a);
    const topSimilarities = similarities.slice(
      0,
      Math.max(1, Math.ceil(similarities.length * 0.3))
    );

    return topSimilarities.reduce((a, b) => a + b, 0) / topSimilarities.length;
  }

  /**
   * Calculate bio text similarity
   */
  private calculateBioSimilarity(
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): number {
    return this.calculateTextSimilarity(user1.bio, user2.bio);
  }

  /**
   * Calculate weather pattern similarity
   */
  private calculateWeatherPatternSimilarity(
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): number {
    const weather1 = user1.weatherFrequency;
    const weather2 = user2.weatherFrequency;

    const allWeathers = new Set([
      ...Object.keys(weather1),
      ...Object.keys(weather2),
    ]);

    if (allWeathers.size === 0) return 1; // Both have no weather data

    let similarity = 0;
    let maxPossibleSimilarity = 0;

    for (const weather of allWeathers) {
      const freq1 = weather1[weather] || 0;
      const freq2 = weather2[weather] || 0;

      // Normalize frequencies
      const normalizedFreq1 = freq1 / user1.totalResonanceCount;
      const normalizedFreq2 = freq2 / user2.totalResonanceCount;

      // Calculate similarity for this weather type
      const weatherSim = 1 - Math.abs(normalizedFreq1 - normalizedFreq2);
      similarity += weatherSim;
      maxPossibleSimilarity += 1;
    }

    return maxPossibleSimilarity > 0 ? similarity / maxPossibleSimilarity : 0;
  }

  /**
   * Calculate energy pattern similarity
   */
  private calculateEnergyPatternSimilarity(
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): number {
    // Energy similarity based on average energy levels
    const energyDifference = Math.abs(
      user1.averageEnergy - user2.averageEnergy
    );

    // Convert to 0-1 similarity (max difference is 100)
    const energySimilarity = 1 - energyDifference / 100;

    // Bonus if both users have substantial resonance data
    const dataVolumeBonus =
      Math.min(user1.totalResonanceCount, user2.totalResonanceCount) > 3
        ? 0.1
        : 0;

    return Math.min(1, energySimilarity + dataVolumeBonus);
  }

  /**
   * Calculate overall similarity between two users
   */
  calculateSimilarity(
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): ResonanceSimilarityScore {
    const factors: ResonanceSimilarityFactors = {
      resonanceTextSimilarity: this.calculateResonanceTextSimilarity(
        user1,
        user2
      ),
      bioSimilarity: this.calculateBioSimilarity(user1, user2),
      weatherPatternSimilarity: this.calculateWeatherPatternSimilarity(
        user1,
        user2
      ),
      energyPatternSimilarity: this.calculateEnergyPatternSimilarity(
        user1,
        user2
      ),
    };

    // Calculate weighted overall score
    const overallScore =
      factors.resonanceTextSimilarity * this.weights.resonanceText +
      factors.bioSimilarity * this.weights.bio +
      factors.weatherPatternSimilarity * this.weights.weatherPattern +
      factors.energyPatternSimilarity * this.weights.energyPattern;

    // Convert to 1-10 scale
    const scaledScore = Math.max(
      1,
      Math.min(10, Math.round(overallScore * 10))
    );

    const explanation = this.generateExplanation(
      factors,
      overallScore,
      user1,
      user2
    );

    return {
      userId1: user1.id,
      userId2: user2.id,
      overallScore: scaledScore,
      factors,
      computedAt: new Date(),
      explanation,
    };
  }

  /**
   * Generate human-readable explanation of similarity
   */
  private generateExplanation(
    factors: ResonanceSimilarityFactors,
    overallScore: number,
    user1: UserResonanceAnalysis,
    user2: UserResonanceAnalysis
  ): string {
    const explanations: string[] = [];

    // Overall similarity level
    let similarityLevel = "WEAK";
    if (overallScore >= 0.8) similarityLevel = "VERY STRONG";
    else if (overallScore >= 0.65) similarityLevel = "STRONG";
    else if (overallScore >= 0.5) similarityLevel = "MODERATE";

    explanations.push(`${similarityLevel} SIMILARITY`);

    // Factor breakdown
    const factorContributions = [
      {
        name: "resonance content",
        value: factors.resonanceTextSimilarity,
        weight: this.weights.resonanceText,
      },
      {
        name: "bio text",
        value: factors.bioSimilarity,
        weight: this.weights.bio,
      },
      {
        name: "weather patterns",
        value: factors.weatherPatternSimilarity,
        weight: this.weights.weatherPattern,
      },
      {
        name: "energy levels",
        value: factors.energyPatternSimilarity,
        weight: this.weights.energyPattern,
      },
    ];

    const topFactors = factorContributions
      .filter((f) => f.value > 0.3) // Only include meaningful similarities
      .sort((a, b) => b.value * b.weight - a.value * a.weight)
      .slice(0, 2);

    if (topFactors.length > 0) {
      const factorDescriptions = topFactors.map((factor) => {
        const percentage = Math.round(factor.value * 100);
        return `${percentage}% ${factor.name} match`;
      });
      explanations.push(`Key matches: ${factorDescriptions.join(", ")}`);
    }

    // Add specific insights
    if (factors.energyPatternSimilarity > 0.7) {
      explanations.push(
        `Similar energy levels (~${Math.round(
          user1.averageEnergy
        )} vs ~${Math.round(user2.averageEnergy)})`
      );
    }

    if (factors.weatherPatternSimilarity > 0.6) {
      const commonWeathers = Object.keys(user1.weatherFrequency).filter(
        (w) =>
          (user2.weatherFrequency[w] || 0) > 0 &&
          (user1.weatherFrequency[w] || 0) + (user2.weatherFrequency[w] || 0) >
            1
      );
      if (commonWeathers.length > 0) {
        explanations.push(`Shared moods: ${commonWeathers.join("")}`);
      }
    }

    return explanations.join(" | ");
  }

  /**
   * Find the most similar profiles for a given user
   */
  findMostSimilarProfiles(
    targetUser: UserResonanceAnalysis,
    allUsers: UserResonanceAnalysis[],
    maxResults = 6
  ): SimilarProfileResult[] {
    const similarities: ResonanceSimilarityScore[] = [];

    for (const otherUser of allUsers) {
      if (otherUser.id !== targetUser.id) {
        const similarity = this.calculateSimilarity(targetUser, otherUser);
        similarities.push(similarity);
      }
    }

    // Sort by similarity score and take top results
    return similarities
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, maxResults)
      .map((sim) => {
        const otherUser = allUsers.find((u) => u.id === sim.userId2);
        if (!otherUser) {
          throw new Error(`User ${sim.userId2} not found in analysis data`);
        }

        const commonWeathers = Object.keys(targetUser.weatherFrequency).filter(
          (w) => (otherUser.weatherFrequency[w] || 0) > 0
        );

        return {
          userId: sim.userId2,
          similarityScore: sim.overallScore,
          explanation: sim.explanation,
          profile: {
            bio: otherUser.bio,
            nickname: "", // Will be filled by the service layer
            recentResonances: otherUser.resonanceEntries.slice(0, 3),
            averageEnergy: otherUser.averageEnergy,
            commonWeatherMoods: commonWeathers,
          },
        };
      });
  }
}
