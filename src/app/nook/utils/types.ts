// Define types for our data structures

// Define a type for node types
export type NodeType = "user" | "project";

export interface User {
  id: string;
  name: string;
  type: NodeType;
  convo: {
    eventsCreated: number;
    rsvps: number;
  };
  profile: {
    image?: string;
    keywords?: string[];
    description?: string;
    city?: string;
    currentAffiliation?: string;
  };
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  keywords?: string[];
  url?: string;
  isFellow?: boolean;
  startDate?: string;
  endDate?: string;
  status?: "active" | "completed" | "planned";
}

export interface Link {
  source: string | { id: string };
  target: string | { id: string };
  type?: string; // Optional type for the link (e.g., "contributor", "creator", etc.)
}
