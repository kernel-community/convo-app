// Sample data with 10 nodes
export const data = {
  nodes: [
    { id: "user1", name: "Emma", eventsCreated: 5, rsvps: 12 },
    { id: "user2", name: "Liam", eventsCreated: 2, rsvps: 8 },
    { id: "user3", name: "Olivia", eventsCreated: 7, rsvps: 15 },
    { id: "user4", name: "Noah", eventsCreated: 1, rsvps: 6 },
    { id: "user5", name: "Ava", eventsCreated: 3, rsvps: 9 },
    { id: "user6", name: "Ethan", eventsCreated: 0, rsvps: 4 },
    { id: "user7", name: "Sophia", eventsCreated: 4, rsvps: 10 },
    { id: "user8", name: "Mason", eventsCreated: 2, rsvps: 7 },
    { id: "user9", name: "Isabella", eventsCreated: 6, rsvps: 14 },
    { id: "user10", name: "Logan", eventsCreated: 1, rsvps: 5 },
  ],
  links: [
    // Core community 1
    { source: "user1", target: "user2", value: 5 },
    { source: "user1", target: "user3", value: 4 },
    { source: "user1", target: "user9", value: 6 },
    { source: "user2", target: "user3", value: 3 },
    { source: "user3", target: "user9", value: 5 },

    // Core community 2
    { source: "user4", target: "user5", value: 4 },
    { source: "user4", target: "user10", value: 2 },
    { source: "user5", target: "user10", value: 3 },

    // Core community 3
    { source: "user6", target: "user7", value: 4 },
    { source: "user6", target: "user8", value: 3 },
    { source: "user7", target: "user8", value: 5 },

    // Cross-community connections
    { source: "user5", target: "user1", value: 1 },
    { source: "user8", target: "user4", value: 1 },
    { source: "user9", target: "user6", value: 2 },

    // Bidirectional connection example
    { source: "user2", target: "user7", value: 4 },
    { source: "user7", target: "user2", value: 3 },
  ],
};
