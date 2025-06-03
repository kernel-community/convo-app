import { useState, useEffect } from "react";

type Community = {
  id: string;
  displayName: string;
  subdomain: string;
  description?: string;
};

export const useCommunity = () => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/community/current", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch community info");
        }

        const data = await response.json();
        setCommunity(data.community);
        setError(null);
      } catch (err) {
        console.error("Error fetching community:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setCommunity(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunity();
  }, []);

  return { community, isLoading, error };
};
