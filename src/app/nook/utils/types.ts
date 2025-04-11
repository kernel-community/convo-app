// Define types for our data structures

// Define a type for node types
export type NodeType = "user";

export interface User {
  id: string;
  name: string;
  type: NodeType;
  convo: {
    eventsCreated: number;
    rsvps: number;
  };
  profile?: {
    image?: string;
    keywords?: string[];
    description?: string;
    currentAffiliation?: string;
    city?: string;
    bio?: string;
  };
  url?: string;
  isFellow?: boolean;
}

export interface Link {
  source: string | { id: string };
  target: string | { id: string };
  type?: string; // Optional type for the link (e.g., "contributor", "creator", etc.)
}
