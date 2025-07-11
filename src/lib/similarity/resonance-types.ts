export interface ResonanceEntry {
  text: string;
  weather?: string;
  energy: number;
  timestamp: string;
}

export interface ResonanceSimilarityFactors {
  resonanceTextSimilarity: number; // 0-1: Semantic similarity between all resonance texts
  bioSimilarity: number; // 0-1: Traditional text similarity on bio field
  weatherPatternSimilarity: number; // 0-1: Similar weather/mood preferences
  energyPatternSimilarity: number; // 0-1: Similar energy levels and patterns
}

export interface ResonanceSimilarityWeights {
  resonanceText: number; // 40%: Main factor - semantic similarity of resonance content
  bio: number; // 30%: Bio text similarity
  weatherPattern: number; // 15%: Weather preference similarity
  energyPattern: number; // 15%: Energy level similarity
}

export const DEFAULT_RESONANCE_SIMILARITY_WEIGHTS: ResonanceSimilarityWeights =
  {
    resonanceText: 0.4,
    bio: 0.3,
    weatherPattern: 0.15,
    energyPattern: 0.15,
  };

export interface UserResonanceAnalysis {
  id: string;
  bio: string;
  resonanceEntries: ResonanceEntry[];
  // Computed patterns for faster comparison
  averageEnergy: number;
  weatherFrequency: Record<string, number>; // weather emoji -> frequency
  recentResonanceTexts: string[]; // Last 10 resonance texts for semantic analysis
  totalResonanceCount: number;
}

export interface ResonanceSimilarityScore {
  userId1: string;
  userId2: string;
  overallScore: number; // 1-10 scale
  factors: ResonanceSimilarityFactors;
  computedAt: Date;
  explanation: string; // Human-readable explanation of similarity
}

export interface SimilarProfileResult {
  userId: string;
  similarityScore: number;
  explanation: string;
  profile: {
    bio?: string;
    nickname: string;
    recentResonances: ResonanceEntry[];
    averageEnergy: number;
    commonWeatherMoods: string[];
  };
}
