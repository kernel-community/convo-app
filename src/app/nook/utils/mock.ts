// Sample data with people and projects
export const data = {
  nodes: [
    {
      id: "user1",
      name: "Emma",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        keywords: ["blockchain", "defi", "ethereum", "community", "governance"],
        description:
          "Blockchain researcher focused on decentralized governance systems and community building.",
        location: {
          id: 1,
          name: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
          description: "City in Northern California, United States",
        },
        currentAffiliation: "Ethereum Foundation",
      },
      url: "https://github.com/emma-blockchain",
    },
    {
      id: "user2",
      name: "Liam",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        keywords: [
          "smart contracts",
          "solidity",
          "web3",
          "security",
          "auditing",
        ],
        description:
          "Smart contract developer with expertise in security auditing and optimization techniques.",
        location: {
          id: 2,
          name: "Berlin",
          latitude: 52.52,
          longitude: 13.405,
          description: "Capital city of Germany",
        },
        currentAffiliation: "ConsenSys",
      },
      url: "https://github.com/liam-solidity",
    },
    {
      id: "user3",
      name: "Olivia",
      type: "user",
      convo: {
        eventsCreated: 7,
        rsvps: 15,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        keywords: [
          "dao",
          "coordination",
          "tokenomics",
          "mechanism design",
          "economics",
        ],
        description:
          "DAO designer specializing in tokenomics and sustainable economic models for web3 communities.",
        location: {
          id: 3,
          name: "New York",
          latitude: 40.7128,
          longitude: -74.006,
          description: "Major city in the United States",
        },
        currentAffiliation: "Gitcoin",
      },
      url: "https://github.com/olivia-dao",
    },
    {
      id: "user4",
      name: "Noah",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 6,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/4.jpg",
        keywords: [
          "zero knowledge",
          "privacy",
          "cryptography",
          "zk-snarks",
          "research",
        ],
        description:
          "Cryptography researcher exploring zero-knowledge proofs and privacy-preserving technologies.",
        location: {
          id: 4,
          name: "Zurich",
          latitude: 47.3769,
          longitude: 8.5417,
          description: "Largest city in Switzerland",
        },
        currentAffiliation: "ETH Zurich",
      },
      url: "https://github.com/noah-zk",
    },
    {
      id: "user5",
      name: "Ava",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/5.jpg",
        keywords: ["frontend", "design", "ux", "web3", "accessibility"],
        description:
          "Frontend developer and designer creating intuitive interfaces for decentralized applications.",
        location: {
          id: 5,
          name: "London",
          latitude: 51.5074,
          longitude: -0.1278,
          description: "Capital city of England and the United Kingdom",
        },
        currentAffiliation: "Aave",
      },
      url: "https://github.com/ava-design",
    },
    {
      id: "user6",
      name: "Ethan",
      type: "user",
      convo: {
        eventsCreated: 0,
        rsvps: 4,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/6.jpg",
        keywords: [
          "nft",
          "digital art",
          "curation",
          "creative coding",
          "generative",
        ],
        description:
          "Digital artist exploring the intersection of generative art, NFTs, and on-chain aesthetics.",
        location: {
          id: 6,
          name: "Paris",
          latitude: 48.8566,
          longitude: 2.3522,
          description: "Capital city of France",
        },
        currentAffiliation: "Foundation",
      },
      url: "https://github.com/ethan-art",
    },
    {
      id: "user7",
      name: "Sophia",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/7.jpg",
        keywords: [
          "community",
          "education",
          "onboarding",
          "events",
          "facilitation",
        ],
        description:
          "Community builder focused on educational initiatives and meaningful connection through events.",
        location: {
          id: 7,
          name: "Austin",
          latitude: 30.2672,
          longitude: -97.7431,
          description: "Capital city of Texas, United States",
        },
        currentAffiliation: "Kernel Community",
      },
      url: "https://github.com/sophia-community",
    },
    {
      id: "user8",
      name: "Mason",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/8.jpg",
        keywords: ["infrastructure", "devops", "scaling", "nodes", "protocols"],
        description:
          "Infrastructure engineer building resilient systems for decentralized protocols and applications.",
        location: {
          id: 8,
          name: "Singapore",
          latitude: 1.3521,
          longitude: 103.8198,
          description: "City-state in Southeast Asia",
        },
        currentAffiliation: "Infura",
      },
      url: "https://github.com/mason-infra",
    },
    {
      id: "user9",
      name: "Isabella",
      type: "user",
      convo: {
        eventsCreated: 6,
        rsvps: 14,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/9.jpg",
        keywords: [
          "research",
          "economics",
          "game theory",
          "incentives",
          "markets",
        ],
        description:
          "Economic researcher studying incentive mechanisms and market design in decentralized systems.",
        location: {
          id: 9,
          name: "Toronto",
          latitude: 43.6532,
          longitude: -79.3832,
          description: "Capital city of Ontario, Canada",
        },
        currentAffiliation: "Optimism",
      },
      url: "https://github.com/isabella-econ",
    },
    {
      id: "user10",
      name: "Logan",
      convo: {
        eventsCreated: 1,
        rsvps: 5,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/10.jpg",
        keywords: ["defi", "trading", "analytics", "data science", "risk"],
        description:
          "DeFi analyst with expertise in risk assessment and data-driven protocol optimization.",
        location: {
          id: 10,
          name: "Miami",
          latitude: 25.7617,
          longitude: -80.1918,
          description: "City in Florida, United States",
        },
        currentAffiliation: "Uniswap Labs",
      },
      url: "https://github.com/logan-defi",
      type: "user",
    },
    // Project nodes
    {
      id: "project1",
      name: "Decentralized Identity Framework",
      type: "project",
      description:
        "A framework for self-sovereign identity using zero-knowledge proofs and blockchain attestations.",
      keywords: [
        "identity",
        "zero knowledge",
        "privacy",
        "attestations",
        "blockchain",
      ],
      url: "https://github.com/kernel-community/identity-framework",
      isFellow: true,
      startDate: "2023-01-15",
      endDate: "2023-06-30",
      status: "completed",
    },
    {
      id: "project2",
      name: "DAO Governance Toolkit",
      type: "project",
      description:
        "A modular toolkit for creating and managing decentralized autonomous organizations with customizable governance mechanisms.",
      keywords: ["dao", "governance", "voting", "coordination", "tokenomics"],
      url: "https://github.com/kernel-community/dao-toolkit",
      isFellow: true,
      startDate: "2023-03-10",
      status: "active",
    },
    {
      id: "project3",
      name: "Web3 Education Platform",
      type: "project",
      description:
        "An interactive learning platform for blockchain and web3 technologies with hands-on coding exercises and community-driven content.",
      keywords: ["education", "learning", "web3", "community", "interactive"],
      url: "https://github.com/kernel-community/web3-education",
      isFellow: false,
      startDate: "2023-05-22",
      status: "active",
    },
    {
      id: "project4",
      name: "Decentralized Art Marketplace",
      type: "project",
      description:
        "A platform for artists to create, showcase, and sell digital art with built-in royalty mechanisms and collaborative creation tools.",
      keywords: ["nft", "art", "marketplace", "royalties", "collaboration"],
      url: "https://github.com/kernel-community/art-marketplace",
      isFellow: true,
      startDate: "2023-02-18",
      endDate: "2023-08-15",
      status: "completed",
    },
    {
      id: "project5",
      name: "Smart Contract Security Scanner",
      type: "project",
      description:
        "An automated tool for identifying vulnerabilities and optimization opportunities in Solidity smart contracts.",
      keywords: [
        "security",
        "smart contracts",
        "auditing",
        "solidity",
        "analysis",
      ],
      url: "https://github.com/kernel-community/contract-scanner",
      isFellow: false,
      startDate: "2023-07-05",
      status: "active",
    },
  ],

  links: [
    // Core community 1
    { source: "user1", target: "user2" },
    { source: "user1", target: "user3" },
    { source: "user2", target: "user3" },
    { source: "user2", target: "user4" },
    { source: "user3", target: "user4" },
    { source: "user3", target: "user5" },

    // Core community 2
    { source: "user6", target: "user7" },
    { source: "user6", target: "user8" },
    { source: "user7", target: "user8" },
    { source: "user7", target: "user9" },
    { source: "user8", target: "user9" },
    { source: "user8", target: "user10" },

    // Bridge connections
    { source: "user3", target: "user7" },
    { source: "user4", target: "user6" },
    { source: "user5", target: "user8" },

    // Peripheral connections
    { source: "user1", target: "user10" },
    { source: "user2", target: "user9" },
    { source: "user4", target: "user10" },
    { source: "user5", target: "user6" },
    { source: "user9", target: "user1" },
    { source: "user10", target: "user3" },

    // Project connections
    { source: "user1", target: "project1", type: "contributor" },
    { source: "user1", target: "project2", type: "creator" },
    { source: "user2", target: "project5", type: "creator" },
    { source: "user3", target: "project2", type: "contributor" },
    { source: "user3", target: "project3", type: "contributor" },
    { source: "user4", target: "project1", type: "creator" },
    { source: "user5", target: "project3", type: "creator" },
    { source: "user5", target: "project4", type: "contributor" },
    { source: "user6", target: "project4", type: "creator" },
    { source: "user7", target: "project3", type: "contributor" },
    { source: "user8", target: "project5", type: "contributor" },
    { source: "user9", target: "project1", type: "contributor" },
    { source: "user10", target: "project4", type: "contributor" },
  ],
};

// Define the LocationData type for better type safety
export interface LocationData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

// Filter out undefined values and assert the type
export const locations = data.nodes
  .map((node) => node?.profile?.location)
  .filter(Boolean) as LocationData[];
