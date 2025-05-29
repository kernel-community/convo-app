import { useQuery } from "react-query";

interface Node {
  id: string;
  name: string;
  type: "user";
  convo: {
    eventsCreated: number;
    rsvps: number;
  };
  profile: {
    image: string;
    keywords: string[];
    bio: string;
    currentAffiliation: string;
    url: string;
  };
}

interface Link {
  source: string;
  target: string;
  weight: number;
  description?: string; // Detailed similarity calculation description
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

const fetchNetworkData = async (): Promise<NetworkData> => {
  const response = await fetch("/api/nook/network-data", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch network data");
  }

  return response.json();
};

export const useNetworkData = () => {
  return useQuery(["networkData"], fetchNetworkData, {
    staleTime: 1000 * 60, // Consider data stale after 10 seconds
    refetchInterval: 1000 * 60, // Refetch every 10 seconds for near real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
