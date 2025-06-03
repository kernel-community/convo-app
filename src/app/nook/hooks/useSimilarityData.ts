import { useQuery } from "react-query";

interface SimilarityStats {
  totalConnections: number;
  averageWeight: number;
  weightDistribution: { [weight: number]: number };
  highSimilarityPairs: number;
  lastCalculated: Date | null;
}

interface SimilarityBreakdown {
  userId1: string;
  userId2: string;
  overallScore: number;
  factors: {
    keywordSimilarity: number;
    bioSimilarity: number;
    affiliationMatch: number;
  };
  computedAt: Date;
}

const fetchSimilarityStats = async (): Promise<SimilarityStats> => {
  const response = await fetch("/api/similarity/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "stats" }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch similarity stats");
  }

  const result = await response.json();
  return result.data;
};

const fetchSimilarityBreakdown = async (
  userId1: string,
  userId2: string
): Promise<SimilarityBreakdown> => {
  const response = await fetch(
    `/api/similarity/calculate?userId1=${userId1}&userId2=${userId2}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch similarity breakdown");
  }

  const result = await response.json();
  return result.data;
};

export const useSimilarityStats = () => {
  return useQuery(["similarityStats"], fetchSimilarityStats, {
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useSimilarityBreakdown = (
  userId1: string | null,
  userId2: string | null
) => {
  return useQuery(
    ["similarityBreakdown", userId1, userId2],
    () => {
      if (!userId1 || !userId2) {
        throw new Error("Both user IDs are required");
      }
      return fetchSimilarityBreakdown(userId1, userId2);
    },
    {
      enabled: !!userId1 && !!userId2,
      staleTime: 1000 * 60 * 10, // Consider data stale after 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );
};

export const useCalculateSimilarity = () => {
  const calculateAll = async () => {
    const response = await fetch("/api/similarity/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "all" }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to calculate similarities");
    }

    return response.json();
  };

  const calculateForUser = async (userId: string) => {
    const response = await fetch("/api/similarity/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "user", userId }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to calculate similarities for user");
    }

    return response.json();
  };

  return {
    calculateAll,
    calculateForUser,
  };
};
