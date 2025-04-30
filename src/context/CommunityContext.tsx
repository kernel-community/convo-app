"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Community } from "@prisma/client";

type CommunityContextType = {
  community: Community | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

const CommunityContext = createContext<CommunityContextType>({
  community: null,
  isLoading: true,
  error: null,
  refetch: async () => {
    /* Implementation provided by provider */
  },
});

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommunity = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/query/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setCommunity(result.data);
      } else {
        setError(new Error(result.error || "Failed to fetch community"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, []);

  const refetch = async () => {
    await fetchCommunity();
  };

  return (
    <CommunityContext.Provider value={{ community, isLoading, error, refetch }}>
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => useContext(CommunityContext);
