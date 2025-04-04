// Define types for our data structures
export interface User {
  id: string;
  name: string;
  eventsCreated: number;
  rsvps: number;
}

export interface Link {
  source: string | { id: string };
  target: string | { id: string };
  value: number;
}
