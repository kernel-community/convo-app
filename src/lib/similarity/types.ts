export interface SimilarityFactors {
  keywordSimilarity: number;
  bioSimilarity: number;
  affiliationMatch: number;
}

export interface SimilarityWeights {
  keywords: number;
  bio: number;
  affiliation: number;
}

export interface UserSimilarityScore {
  userId1: string;
  userId2: string;
  overallScore: number;
  factors: SimilarityFactors;
  computedAt: Date;
}

export interface UserProfileAnalysis {
  id: string;
  keywords: string[];
  bio: string;
  affiliation: string;
}

export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  keywords: 0.3, // Profile: 100% total (30% keywords)
  bio: 0.45, // Profile: 45% bio
  affiliation: 0.25, // Profile: 25% affiliation
};
