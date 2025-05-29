import type {
  SimilarityFactors,
  SimilarityWeights,
  UserSimilarityScore,
  UserProfileAnalysis,
} from "./types";
import { DEFAULT_SIMILARITY_WEIGHTS } from "./types";

export class SimilarityCalculator {
  private weights: SimilarityWeights;

  constructor(weights: SimilarityWeights = DEFAULT_SIMILARITY_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Get the current weights used for similarity calculations
   */
  getWeights(): SimilarityWeights {
    return this.weights;
  }

  /**
   * Get detailed keyword matching information
   */
  getKeywordMatchDetails(
    keywords1: string[],
    keywords2: string[]
  ): {
    matches: string[];
    unique1: string[];
    unique2: string[];
    similarity: number;
  } {
    const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
    const set2 = new Set(keywords2.map((k) => k.toLowerCase()));

    const matches = [...set1].filter((x) => set2.has(x));
    const unique1 = [...set1].filter((x) => !set2.has(x));
    const unique2 = [...set2].filter((x) => !set1.has(x));

    const similarity = this.calculateKeywordSimilarity(keywords1, keywords2);

    return {
      matches,
      unique1,
      unique2,
      similarity,
    };
  }

  /**
   * Get detailed bio matching information
   */
  getBioMatchDetails(
    bio1: string,
    bio2: string
  ): {
    matches: string[];
    unique1: string[];
    unique2: string[];
    similarity: number;
  } {
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
              "old",
              "put",
              "say",
              "she",
              "too",
              "use",
            ].includes(word)
        );
    };

    const tokens1 = tokenize(bio1);
    const tokens2 = tokenize(bio2);

    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const matches = [...set1].filter((x) => set2.has(x));
    const unique1 = [...set1].filter((x) => !set2.has(x));
    const unique2 = [...set2].filter((x) => !set1.has(x));

    const similarity = this.calculateBioSimilarity(bio1, bio2);

    return {
      matches,
      unique1,
      unique2,
      similarity,
    };
  }

  /**
   * Get detailed affiliation matching information
   */
  getAffiliationMatchDetails(
    affiliation1: string,
    affiliation2: string
  ): {
    matchType: "exact" | "partial" | "keyword" | "none";
    matchedParts: string[];
    similarity: number;
  } {
    if (!affiliation1 || !affiliation2) {
      return {
        matchType: "none",
        matchedParts: [],
        similarity: 0,
      };
    }

    const norm1 = affiliation1.toLowerCase().trim();
    const norm2 = affiliation2.toLowerCase().trim();

    if (norm1 === norm2) {
      return {
        matchType: "exact",
        matchedParts: [affiliation1],
        similarity: 1,
      };
    }

    // Check for partial matches
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      const shorterAffiliation =
        norm1.length < norm2.length ? affiliation1 : affiliation2;
      return {
        matchType: "partial",
        matchedParts: [shorterAffiliation],
        similarity: 0.7,
      };
    }

    // Check for keyword matches
    const keywords1 = norm1.split(/\s+/);
    const keywords2 = norm2.split(/\s+/);
    const commonKeywords = keywords1.filter(
      (k) => keywords2.includes(k) && k.length > 2
    );

    if (commonKeywords.length > 0) {
      return {
        matchType: "keyword",
        matchedParts: commonKeywords,
        similarity: Math.min(
          0.5,
          commonKeywords.length / Math.max(keywords1.length, keywords2.length)
        ),
      };
    }

    return {
      matchType: "none",
      matchedParts: [],
      similarity: 0,
    };
  }

  /**
   * Calculate Jaccard similarity for keyword arrays
   */
  calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 1;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
    const set2 = new Set(keywords2.map((k) => k.toLowerCase()));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate bio similarity using TF-IDF approach
   */
  calculateBioSimilarity(bio1: string, bio2: string): number {
    if (!bio1 || !bio2) return 0;

    // Simple approach: tokenize, normalize, and calculate overlap
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
              "old",
              "put",
              "say",
              "she",
              "too",
              "use",
            ].includes(word)
        );
    };

    const tokens1 = tokenize(bio1);
    const tokens2 = tokenize(bio2);

    if (tokens1.length === 0 && tokens2.length === 0) return 1;
    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Check if affiliations match (exact or partial)
   */
  calculateAffiliationMatch(
    affiliation1: string,
    affiliation2: string
  ): number {
    if (!affiliation1 || !affiliation2) return 0;

    const norm1 = affiliation1.toLowerCase().trim();
    const norm2 = affiliation2.toLowerCase().trim();

    if (norm1 === norm2) return 1;

    // Check for partial matches (e.g., "Google" in "Google Research")
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.7;

    // Check for similar companies/organizations
    const keywords1 = norm1.split(/\s+/);
    const keywords2 = norm2.split(/\s+/);
    const commonKeywords = keywords1.filter(
      (k) => keywords2.includes(k) && k.length > 2
    );

    if (commonKeywords.length > 0) {
      return Math.min(
        0.5,
        commonKeywords.length / Math.max(keywords1.length, keywords2.length)
      );
    }

    return 0;
  }

  /**
   * Calculate overall similarity score between two users
   */
  calculateSimilarity(
    user1: UserProfileAnalysis,
    user2: UserProfileAnalysis
  ): UserSimilarityScore {
    const factors: SimilarityFactors = {
      keywordSimilarity: this.calculateKeywordSimilarity(
        user1.keywords,
        user2.keywords
      ),
      bioSimilarity: this.calculateBioSimilarity(user1.bio, user2.bio),
      affiliationMatch: this.calculateAffiliationMatch(
        user1.affiliation,
        user2.affiliation
      ),
    };

    // Calculate weighted overall score (Profile factors only - 100%)
    const overallScore =
      factors.keywordSimilarity * this.weights.keywords +
      factors.bioSimilarity * this.weights.bio +
      factors.affiliationMatch * this.weights.affiliation;

    return {
      userId1: user1.id,
      userId2: user2.id,
      overallScore: Math.round(overallScore * 10), // Convert to 1-10 scale
      factors,
      computedAt: new Date(),
    };
  }

  /**
   * Batch calculate similarities for all user pairs
   */
  calculateAllSimilarities(
    users: UserProfileAnalysis[]
  ): UserSimilarityScore[] {
    const results: UserSimilarityScore[] = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const similarity = this.calculateSimilarity(users[i]!, users[j]!);
        results.push(similarity);
      }
    }

    return results.sort((a, b) => b.overallScore - a.overallScore);
  }
}
