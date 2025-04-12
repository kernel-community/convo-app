// Sample data with people and projects
export const data = {
  nodes: [
    {
      id: "user1",
      name: "Emma Thompson",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        keywords: ["blockchain", "defi", "ethereum", "community", "governance"],
        bio: "Blockchain researcher focused on decentralized governance systems and community building.",
        currentAffiliation: "Ethereum Foundation",
        url: "https://github.com/emma-blockchain",
      },
    },
    // Add new users with UUIDs
    {
      id: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      name: "Sasha Ivanov",
      type: "user",
      convo: {
        eventsCreated: 8,
        rsvps: 17,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/61.jpg",
        keywords: [
          "protocol design",
          "consensus",
          "distributed systems",
          "scaling",
          "sharding",
        ],
        bio: "Protocol designer specializing in scalable consensus mechanisms and sharding solutions.",
        currentAffiliation: "Near Protocol",
        url: "https://github.com/sasha-protocol",
      },
    },
    {
      id: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      name: "Raj Patel",
      type: "user",
      convo: {
        eventsCreated: 6,
        rsvps: 15,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/62.jpg",
        keywords: [
          "MEV",
          "block building",
          "order flow",
          "auctions",
          "trading",
        ],
        bio: "MEV researcher exploring fair transaction ordering and efficient block space markets.",
        currentAffiliation: "Flashbots",
        url: "https://github.com/raj-mev",
      },
    },
    {
      id: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      name: "Carmen Diaz",
      type: "user",
      convo: {
        eventsCreated: 9,
        rsvps: 21,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/63.jpg",
        keywords: ["regulatory tech", "compliance", "KYC", "AML", "policy"],
        bio: "Regulatory specialist designing compliant on-chain systems and privacy-preserving identity solutions.",
        currentAffiliation: "Compliance DAO",
        url: "https://github.com/carmen-regtech",
      },
    },
    {
      id: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      name: "Feng Liu",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/64.jpg",
        keywords: [
          "zkproofs",
          "cryptography",
          "scalability",
          "privacy",
          "verification",
        ],
        bio: "Zero-knowledge proof systems researcher developing efficient verification for blockchain scaling.",
        currentAffiliation: "StarkWare",
        url: "https://github.com/feng-zkproofs",
      },
    },
    {
      id: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      name: "Zainab Omar",
      type: "user",
      convo: {
        eventsCreated: 7,
        rsvps: 19,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        keywords: [
          "decentralized science",
          "research funding",
          "peer review",
          "academia",
          "grants",
        ],
        bio: "DeSci advocate creating on-chain infrastructure for open science and reproducible research.",
        currentAffiliation: "DeSci Labs",
        url: "https://github.com/zainab-desci",
      },
    },
    {
      id: "741613d6-10dc-4551-b686-39ad00470c95",
      name: "Marcus Wheeler",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/66.jpg",
        keywords: [
          "tokenized real estate",
          "property fractionalization",
          "REITs",
          "markets",
          "investing",
        ],
        bio: "Real estate tokenization expert developing liquid markets for property investments.",
        currentAffiliation: "Token Estates",
        url: "https://github.com/marcus-realestate",
      },
    },
    {
      id: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      name: "Jin Park",
      type: "user",
      convo: {
        eventsCreated: 6,
        rsvps: 14,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        keywords: [
          "defi aggregation",
          "yield optimization",
          "vaults",
          "composability",
          "automation",
        ],
        bio: "DeFi architect building cross-chain yield optimization strategies and automated portfolio management.",
        currentAffiliation: "Yearn Finance",
        url: "https://github.com/jin-defi",
      },
    },
    {
      id: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      name: "Eliza Cortez",
      type: "user",
      convo: {
        eventsCreated: 8,
        rsvps: 20,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        keywords: [
          "climate finance",
          "carbon credits",
          "regenerative economics",
          "impact",
          "sustainability",
        ],
        bio: "Climate finance innovator creating regenerative economic systems and transparent carbon markets.",
        currentAffiliation: "Regen Network",
        url: "https://github.com/eliza-climate",
      },
    },
    {
      id: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      name: "Jamal Edwards",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 13,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/69.jpg",
        keywords: [
          "decentralized identity",
          "verifiable credentials",
          "self-sovereign",
          "authentication",
          "privacy",
        ],
        bio: "Identity systems engineer building self-sovereign identification and credential verification frameworks.",
        currentAffiliation: "Ceramic Network",
        url: "https://github.com/jamal-identity",
      },
    },
    {
      id: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      name: "Amara Okafor",
      type: "user",
      convo: {
        eventsCreated: 7,
        rsvps: 18,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/70.jpg",
        keywords: [
          "web3 social",
          "decentralized media",
          "creator economy",
          "monetization",
          "communities",
        ],
        bio: "Social platform architect designing creator-owned media networks and community monetization tools.",
        currentAffiliation: "Lens Protocol",
        url: "https://github.com/amara-social",
      },
    },
    {
      id: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      name: "Hiroshi Tanaka",
      type: "user",
      convo: {
        eventsCreated: 6,
        rsvps: 16,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/71.jpg",
        keywords: [
          "cross-chain interoperability",
          "bridges",
          "liquidity",
          "messaging",
          "oracles",
        ],
        bio: "Interoperability specialist developing secure cross-chain bridges and messaging protocols.",
        currentAffiliation: "Axelar Network",
        url: "https://github.com/hiroshi-bridge",
      },
    },
    // Add the new user with the UUID as ID
    {
      id: "user2",
      name: "Angela G",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://kernelconvo.s3.us-east-2.amazonaws.com/angg.png",
        keywords: [
          "smart contracts",
          "solidity",
          "web3",
          "security",
          "auditing",
        ],
        bio: "Smart contract developer with expertise in security auditing and optimization techniques.",
        currentAffiliation: "ConsenSys",
        url: "https://github.com/liam-solidity",
      },
    },
    {
      id: "e55075ef-3076-4019-bb46-854ab2662da1",
      name: "Angela",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://kernelconvo.s3.us-east-2.amazonaws.com/angg.png",
        keywords: [
          "smart contracts",
          "solidity",
          "web3",
          "security",
          "auditing",
        ],
        bio: "Smart contract developer with expertise in security auditing and optimization techniques.",
        currentAffiliation: "ConsenSys",
        url: "https://github.com/liam-solidity",
      },
    },
    {
      id: "user3",
      name: "Olivia Chen",
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
        bio: "DAO designer specializing in tokenomics and sustainable economic models for web3 communities.",
        currentAffiliation: "Gitcoin",
        url: "https://github.com/olivia-dao",
      },
    },
    {
      id: "user4",
      name: "Noah Patel",
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
        bio: "Cryptography researcher exploring zero-knowledge proofs and privacy-preserving technologies.",
        currentAffiliation: "ETH Zurich",
        url: "https://github.com/noah-zk",
      },
    },
    {
      id: "user5",
      name: "Ava Kim",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/5.jpg",
        keywords: ["frontend", "design", "ux", "web3", "accessibility"],
        bio: "Frontend developer and designer creating intuitive interfaces for decentralized applications.",
        currentAffiliation: "Aave",
        url: "https://github.com/ava-design",
      },
    },
    {
      id: "user6",
      name: "Ethan Wilson",
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
        bio: "Digital artist exploring the intersection of generative art, NFTs, and on-chain aesthetics.",
        currentAffiliation: "Foundation",
        url: "https://github.com/ethan-art",
      },
    },
    {
      id: "user7",
      name: "Sophia Garcia",
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
        bio: "Community builder focused on educational initiatives and meaningful connection through events.",
        currentAffiliation: "Kernel Community",
        url: "https://github.com/sophia-community",
      },
    },
    {
      id: "user8",
      name: "Mason Johnson",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/8.jpg",
        keywords: ["infrastructure", "devops", "scaling", "nodes", "protocols"],
        bio: "Infrastructure engineer building resilient systems for decentralized protocols and applications.",
        currentAffiliation: "Infura",
        url: "https://github.com/mason-infra",
      },
    },
    {
      id: "user9",
      name: "Isabella Martinez",
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
        bio: "Economic researcher studying incentive mechanisms and market design in decentralized systems.",
        currentAffiliation: "Optimism",
        url: "https://github.com/isabella-econ",
      },
    },
    {
      id: "user10",
      name: "Logan Brown",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 5,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/10.jpg",
        keywords: ["defi", "trading", "analytics", "data science", "risk"],
        bio: "DeFi analyst with expertise in risk assessment and data-driven protocol optimization.",
        currentAffiliation: "Uniswap Labs",
        url: "https://github.com/logan-defi",
      },
    },
    {
      id: "user11",
      name: "Mia Taylor",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/11.jpg",
        keywords: ["governance", "voting", "daos", "coordination", "social"],
        bio: "Governance specialist working on voting mechanisms and proposal frameworks for DAOs.",
        currentAffiliation: "DAOhaus",
        url: "https://github.com/mia-governance",
      },
    },
    {
      id: "user12",
      name: "Jackson Liu",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/12.jpg",
        keywords: [
          "privacy",
          "messaging",
          "encryption",
          "security",
          "protocols",
        ],
        bio: "Protocol engineer specializing in private messaging and encrypted communication systems.",
        currentAffiliation: "Status",
        url: "https://github.com/jackson-privacy",
      },
    },
    {
      id: "user13",
      name: "Sofia Navarro",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 13,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/13.jpg",
        keywords: ["layer2", "scaling", "rollups", "optimistic", "zkrollups"],
        bio: "Layer 2 researcher focused on scalability solutions and rollup technologies for Ethereum.",
        currentAffiliation: "Polygon",
        url: "https://github.com/sofia-scaling",
      },
    },
    {
      id: "user14",
      name: "Aiden Smith",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/14.jpg",
        keywords: [
          "identity",
          "self-sovereign",
          "authentication",
          "credentials",
          "verification",
        ],
        bio: "Identity specialist building self-sovereign identity solutions and verifiable credential systems.",
        currentAffiliation: "Spruce",
        url: "https://github.com/aiden-identity",
      },
    },
    {
      id: "user15",
      name: "Charlotte Williams",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/15.jpg",
        keywords: ["social", "reputation", "trust", "attestations", "web3"],
        bio: "Social systems designer focused on reputation, trust mechanisms and attestation networks.",
        currentAffiliation: "BrightID",
        url: "https://github.com/charlotte-social",
      },
    },
    {
      id: "user16",
      name: "Lucas Nguyen",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/16.jpg",
        keywords: ["oracles", "data", "apis", "integration", "web3"],
        bio: "Oracle network developer building reliable data feeds and API integrations for smart contracts.",
        currentAffiliation: "Chainlink",
        url: "https://github.com/lucas-oracles",
      },
    },
    {
      id: "user17",
      name: "Amelia Carter",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/17.jpg",
        keywords: ["virtual worlds", "metaverse", "land", "avatars", "spatial"],
        bio: "Virtual world architect designing spatial experiences and avatar-based social interactions.",
        currentAffiliation: "Decentraland",
        url: "https://github.com/amelia-virtual",
      },
    },
    {
      id: "user18",
      name: "Henry Garcia",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 6,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/18.jpg",
        keywords: [
          "security",
          "auditing",
          "vulnerabilities",
          "defense",
          "analysis",
        ],
        bio: "Security researcher specializing in smart contract audits and vulnerability detection.",
        currentAffiliation: "OpenZeppelin",
        url: "https://github.com/henry-security",
      },
    },
    {
      id: "user19",
      name: "Evelyn Wu",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/19.jpg",
        keywords: ["exchanges", "trading", "markets", "liquidity", "dex"],
        bio: "Exchange protocol designer working on decentralized trading platforms and liquidity solutions.",
        currentAffiliation: "dYdX",
        url: "https://github.com/evelyn-exchange",
      },
    },
    {
      id: "user20",
      name: "Wyatt Jones",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/20.jpg",
        keywords: ["staking", "validation", "consensus", "pos", "rewards"],
        bio: "Staking protocol engineer building validation mechanisms and reward distribution systems.",
        currentAffiliation: "Lido",
        url: "https://github.com/wyatt-staking",
      },
    },
    {
      id: "user21",
      name: "Abigail Thomas",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 14,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/21.jpg",
        keywords: ["education", "learning", "courses", "knowledge", "curation"],
        bio: "Education coordinator developing web3 learning pathways and decentralized knowledge systems.",
        currentAffiliation: "RabbitHole",
        url: "https://github.com/abigail-education",
      },
    },
    {
      id: "user22",
      name: "Sebastian Lee",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/22.jpg",
        keywords: ["wallets", "accounts", "key management", "ux", "security"],
        bio: "Wallet developer focused on key management UX and secure transaction experiences.",
        currentAffiliation: "Rainbow",
        url: "https://github.com/sebastian-wallets",
      },
    },
    {
      id: "user23",
      name: "Lily Rodriguez",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/23.jpg",
        keywords: ["music", "nfts", "royalties", "streaming", "creators"],
        bio: "Music platform designer building decentralized royalty systems for artists and creators.",
        currentAffiliation: "Audius",
        url: "https://github.com/lily-music",
      },
    },
    {
      id: "user24",
      name: "Daniel Kim",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/24.jpg",
        keywords: [
          "stable assets",
          "algorithmic",
          "pegs",
          "monetary",
          "finance",
        ],
        bio: "Stablecoin developer researching algorithmic design and stability mechanisms.",
        currentAffiliation: "Maker",
        url: "https://github.com/daniel-stable",
      },
    },
    {
      id: "user25",
      name: "Zoe Martin",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 13,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/25.jpg",
        keywords: [
          "regenerative",
          "climate",
          "carbon",
          "impact",
          "sustainability",
        ],
        bio: "Regenerative finance specialist developing carbon credit markets and climate impact initiatives.",
        currentAffiliation: "Toucan Protocol",
        url: "https://github.com/zoe-climate",
      },
    },
    {
      id: "user26",
      name: "Matthew Wilson",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/26.jpg",
        keywords: ["legal", "regulation", "compliance", "policy", "governance"],
        bio: "Legal specialist navigating regulatory frameworks for DAOs and decentralized systems.",
        currentAffiliation: "LexDAO",
        url: "https://github.com/matthew-legal",
      },
    },
    {
      id: "user27",
      name: "Victoria Clark",
      type: "user",
      convo: {
        eventsCreated: 6,
        rsvps: 15,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/27.jpg",
        keywords: [
          "gaming",
          "nfts",
          "play-to-earn",
          "virtual assets",
          "game economics",
        ],
        bio: "Game economist designing play-to-earn systems and in-game asset economies.",
        currentAffiliation: "Axie Infinity",
        url: "https://github.com/victoria-games",
      },
    },
    {
      id: "user28",
      name: "Leo Mitchell",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/28.jpg",
        keywords: [
          "bridges",
          "interoperability",
          "cross-chain",
          "messaging",
          "protocols",
        ],
        bio: "Bridge protocol engineer working on secure cross-chain messaging and asset transfers.",
        currentAffiliation: "Connext",
        url: "https://github.com/leo-bridges",
      },
    },
    {
      id: "user29",
      name: "Nora Patel",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/29.jpg",
        keywords: [
          "prediction markets",
          "forecasting",
          "wisdom of crowds",
          "oracles",
          "information",
        ],
        bio: "Prediction market designer building forecasting platforms and information discovery mechanisms.",
        currentAffiliation: "Gnosis",
        url: "https://github.com/nora-prediction",
      },
    },
    {
      id: "user30",
      name: "Caleb White",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 6,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/30.jpg",
        keywords: ["mobile", "apps", "ux", "adoption", "onboarding"],
        bio: "Mobile developer creating accessible entry points and intuitive experiences for web3.",
        currentAffiliation: "Argent",
        url: "https://github.com/caleb-mobile",
      },
    },
    {
      id: "user31",
      name: "Stella Turner",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/31.jpg",
        keywords: [
          "data dao",
          "analysis",
          "collaboration",
          "sharing",
          "governance",
        ],
        bio: "Data DAO researcher exploring collaborative data ownership and governance models.",
        currentAffiliation: "Ocean Protocol",
        url: "https://github.com/stella-data",
      },
    },
    {
      id: "user32",
      name: "Zachary Brown",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        keywords: ["physical", "hardware", "iot", "sensors", "web3"],
        bio: "Hardware engineer connecting physical infrastructure to blockchain networks and IoT systems.",
        currentAffiliation: "Helium",
        url: "https://github.com/zachary-hardware",
      },
    },
    {
      id: "user33",
      name: "Hazel Garcia",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 13,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/33.jpg",
        keywords: ["insurance", "risk", "coverage", "mutuals", "parametric"],
        bio: "Insurance protocol designer building decentralized risk sharing and coverage systems.",
        currentAffiliation: "Nexus Mutual",
        url: "https://github.com/hazel-insurance",
      },
    },
    {
      id: "user34",
      name: "Owen Martinez",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/34.jpg",
        keywords: [
          "content",
          "publishing",
          "monetization",
          "creators",
          "media",
        ],
        bio: "Content platform architect working on decentralized publishing and creator monetization.",
        currentAffiliation: "Mirror",
        url: "https://github.com/owen-content",
      },
    },
    {
      id: "user35",
      name: "Chloe Anderson",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/35.jpg",
        keywords: ["lending", "borrowing", "credit", "risk", "markets"],
        bio: "Lending protocol designer developing decentralized credit markets and capital efficiency tools.",
        currentAffiliation: "Compound",
        url: "https://github.com/chloe-lending",
      },
    },
    {
      id: "user36",
      name: "Elijah Thomas",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/36.jpg",
        keywords: ["storage", "files", "data", "persistence", "distributed"],
        bio: "Distributed storage engineer building resilient file systems and data persistence solutions.",
        currentAffiliation: "IPFS",
        url: "https://github.com/elijah-storage",
      },
    },
    {
      id: "user37",
      name: "Audrey Lee",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/37.jpg",
        keywords: [
          "payments",
          "transactions",
          "remittance",
          "fiat onramp",
          "global",
        ],
        bio: "Payment systems architect creating global transaction networks and fiat onramps.",
        currentAffiliation: "Circle",
        url: "https://github.com/audrey-payments",
      },
    },
    {
      id: "user38",
      name: "Gabriel Wilson",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 6,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/38.jpg",
        keywords: ["api", "developer tools", "sdk", "libraries", "integration"],
        bio: "Developer tools specialist building SDKs and APIs for web3 application integration.",
        currentAffiliation: "Alchemy",
        url: "https://github.com/gabriel-tools",
      },
    },
    {
      id: "user39",
      name: "Scarlett Harris",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 14,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/39.jpg",
        keywords: ["community", "growth", "dao", "incentives", "engagement"],
        bio: "Community growth strategist designing engagement systems and contributor incentives.",
        currentAffiliation: "Coordinape",
        url: "https://github.com/scarlett-community",
      },
    },
    {
      id: "user40",
      name: "Levi Clark",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/40.jpg",
        keywords: [
          "privacy",
          "mixing",
          "confidential",
          "anonymous",
          "transactions",
        ],
        bio: "Privacy protocol engineer developing transaction anonymity and confidential asset solutions.",
        currentAffiliation: "Tornado Cash",
        url: "https://github.com/levi-privacy",
      },
    },
    {
      id: "user41",
      name: "Madeline Wright",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 12,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/41.jpg",
        keywords: [
          "decentralized science",
          "research",
          "funding",
          "peer review",
          "collaboration",
        ],
        bio: "Open science advocate building decentralized research funding and peer review mechanisms.",
        currentAffiliation: "ResearchHub",
        url: "https://github.com/madeline-science",
      },
    },
    {
      id: "user42",
      name: "Julian Nguyen",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/42.jpg",
        keywords: [
          "derivatives",
          "options",
          "futures",
          "trading",
          "risk management",
        ],
        bio: "Derivatives protocol engineer designing on-chain options and futures trading platforms.",
        currentAffiliation: "Opyn",
        url: "https://github.com/julian-derivatives",
      },
    },
    {
      id: "user43",
      name: "Eleanor Lewis",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/43.jpg",
        keywords: ["art", "curation", "museums", "galleries", "exhibitions"],
        bio: "Digital art curator developing web3 exhibition spaces and collection management tools.",
        currentAffiliation: "SuperRare",
        url: "https://github.com/eleanor-curator",
      },
    },
    {
      id: "user44",
      name: "Miles Parker",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 9,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/44.jpg",
        keywords: [
          "real estate",
          "property",
          "tokenization",
          "fractionalization",
          "assets",
        ],
        bio: "Real estate tokenization specialist working on property fractionalization and ownership models.",
        currentAffiliation: "RealT",
        url: "https://github.com/miles-realestate",
      },
    },
    {
      id: "user45",
      name: "Violet Cruz",
      type: "user",
      convo: {
        eventsCreated: 5,
        rsvps: 13,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        keywords: [
          "user research",
          "accessibility",
          "inclusion",
          "ux design",
          "usability",
        ],
        bio: "User researcher focusing on accessibility and inclusive design for blockchain applications.",
        currentAffiliation: "Ethereum Foundation",
        url: "https://github.com/violet-ux",
      },
    },
    {
      id: "user46",
      name: "Max Thompson",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 6,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/46.jpg",
        keywords: [
          "compute",
          "decentralized",
          "rendering",
          "resources",
          "distribution",
        ],
        bio: "Distributed compute engineer building peer-to-peer resource sharing and rendering networks.",
        currentAffiliation: "Golem",
        url: "https://github.com/max-compute",
      },
    },
    {
      id: "user47",
      name: "Ruby Campbell",
      type: "user",
      convo: {
        eventsCreated: 4,
        rsvps: 11,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/47.jpg",
        keywords: [
          "social tokens",
          "creator economy",
          "communities",
          "fan engagement",
          "monetization",
        ],
        bio: "Social token designer helping creators build community economies and engagement systems.",
        currentAffiliation: "Rally",
        url: "https://github.com/ruby-social",
      },
    },
    {
      id: "user48",
      name: "Ezra Adams",
      type: "user",
      convo: {
        eventsCreated: 2,
        rsvps: 8,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/48.jpg",
        keywords: [
          "identity",
          "reputation",
          "trust",
          "credentials",
          "verification",
        ],
        bio: "Identity and reputation systems researcher focused on decentralized trust mechanisms.",
        currentAffiliation: "Proof of Humanity",
        url: "https://github.com/ezra-identity",
      },
    },
    {
      id: "user49",
      name: "Naomi Roberts",
      type: "user",
      convo: {
        eventsCreated: 3,
        rsvps: 10,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/women/49.jpg",
        keywords: [
          "dao tooling",
          "coordination",
          "organization",
          "automation",
          "governance",
        ],
        bio: "DAO tooling specialist building coordination systems and governance automation tools.",
        currentAffiliation: "Aragon",
        url: "https://github.com/naomi-dao",
      },
    },
    {
      id: "user50",
      name: "Theo Morgan",
      type: "user",
      convo: {
        eventsCreated: 1,
        rsvps: 7,
      },
      profile: {
        image: "https://randomuser.me/api/portraits/men/50.jpg",
        keywords: [
          "liquid staking",
          "derivatives",
          "yield",
          "staking",
          "validators",
        ],
        bio: "Liquid staking protocol designer working on stake delegation and validator networks.",
        currentAffiliation: "Lido",
        url: "https://github.com/theo-staking",
      },
    },
  ],
  links: [
    // Main theme clusters of interconnected people
    // Blockchain/DeFi researcher connections
    { source: "user1", target: "user2", weight: 6 }, // Emma - Liam (blockchain + smart contracts)

    // Add connections for Angela (UUID user)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user1",
      weight: 7,
    }, // Angela - Emma (blockchain connection)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user2",
      weight: 9,
    }, // Angela - Liam (smart contracts connection)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user4",
      weight: 6,
    }, // Angela - Noah (security & cryptography)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user18",
      weight: 8,
    }, // Angela - Henry (security auditing)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user40",
      weight: 5,
    }, // Angela - Levi (privacy protocols)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user10",
      weight: 4,
    }, // Angela - Logan (DeFi connection)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user24",
      weight: 3,
    }, // Angela - Daniel (stablecoins)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user5",
      weight: 5,
    }, // Angela - Ava (frontend)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user7",
      weight: 4,
    }, // Angela - Sophia (community)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user35",
      weight: 6,
    }, // Angela - Chloe (lending protocols)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user22",
      weight: 7,
    }, // Angela - Sebastian (wallets)
    {
      source: "e55075ef-3076-4019-bb46-854ab2662da1",
      target: "user50",
      weight: 2,
    }, // Angela - Theo (liquid staking)

    // Connections for Sasha Ivanov (Protocol Designer)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user1",
      weight: 6,
    }, // Sasha - Emma (blockchain)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user3",
      weight: 7,
    }, // Sasha - Olivia (mechanism design)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user4",
      weight: 8,
    }, // Sasha - Noah (cryptography)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user8",
      weight: 9,
    }, // Sasha - Mason (infrastructure)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user13",
      weight: 9,
    }, // Sasha - Sofia (layer2 scaling)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user28",
      weight: 7,
    }, // Sasha - Leo (interoperability)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user32",
      weight: 5,
    }, // Sasha - Zachary (hardware)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user33",
      weight: 4,
    }, // Sasha - Hazel (risk)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user38",
      weight: 6,
    }, // Sasha - Gabriel (developer tools)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user46",
      weight: 7,
    }, // Sasha - Max (compute)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      weight: 8,
    }, // Sasha - Feng (zkproofs)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 7,
    }, // Sasha - Hiroshi (bridges)

    // Connections for Raj Patel (MEV Researcher)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user2",
      weight: 6,
    }, // Raj - Liam (smart contracts)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user9",
      weight: 8,
    }, // Raj - Isabella (economics)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user10",
      weight: 9,
    }, // Raj - Logan (trading)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user19",
      weight: 9,
    }, // Raj - Evelyn (exchanges)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user29",
      weight: 7,
    }, // Raj - Nora (prediction markets)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user35",
      weight: 7,
    }, // Raj - Chloe (lending)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user42",
      weight: 8,
    }, // Raj - Julian (derivatives)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user1",
      weight: 4,
    }, // Raj - Emma (blockchain)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user18",
      weight: 6,
    }, // Raj - Henry (security)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user3",
      weight: 5,
    }, // Raj - Olivia (mechanism design)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 8,
    }, // Raj - Jin (DeFi)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "e55075ef-3076-4019-bb46-854ab2662da1",
      weight: 5,
    }, // Raj - Angela (smart contracts)

    // Connections for Carmen Diaz (Regulatory Tech)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user14",
      weight: 9,
    }, // Carmen - Aiden (identity)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user15",
      weight: 7,
    }, // Carmen - Charlotte (social trust)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user26",
      weight: 9,
    }, // Carmen - Matthew (legal)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user33",
      weight: 8,
    }, // Carmen - Hazel (insurance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user40",
      weight: 8,
    }, // Carmen - Levi (privacy)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user48",
      weight: 7,
    }, // Carmen - Ezra (identity)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user1",
      weight: 5,
    }, // Carmen - Emma (governance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user11",
      weight: 6,
    }, // Carmen - Mia (governance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user18",
      weight: 5,
    }, // Carmen - Henry (security)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user2",
      weight: 4,
    }, // Carmen - Liam (smart contracts)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 9,
    }, // Carmen - Jamal (identity)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 4,
    }, // Carmen - Amara (creator economy)

    // Connections for Feng Liu (ZKProof Researcher)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user4",
      weight: 9,
    }, // Feng - Noah (cryptography)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user12",
      weight: 7,
    }, // Feng - Jackson (encryption)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user13",
      weight: 8,
    }, // Feng - Sofia (layer2)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user18",
      weight: 6,
    }, // Feng - Henry (security)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user28",
      weight: 7,
    }, // Feng - Leo (bridges)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user40",
      weight: 9,
    }, // Feng - Levi (privacy)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user45",
      weight: 4,
    }, // Feng - Violet (UX)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user1",
      weight: 5,
    }, // Feng - Emma (blockchain)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user2",
      weight: 5,
    }, // Feng - Liam (smart contracts)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user8",
      weight: 4,
    }, // Feng - Mason (infrastructure)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 8,
    }, // Feng - Jamal (identity)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      weight: 8,
    }, // Feng - Sasha (protocols)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "e55075ef-3076-4019-bb46-854ab2662da1",
      weight: 6,
    }, // Feng - Angela (security)

    // Connections for Zainab Omar (DeSci Advocate)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user7",
      weight: 7,
    }, // Zainab - Sophia (community)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user21",
      weight: 9,
    }, // Zainab - Abigail (education)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user25",
      weight: 8,
    }, // Zainab - Zoe (regenerative)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user31",
      weight: 9,
    }, // Zainab - Stella (data DAO)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user34",
      weight: 7,
    }, // Zainab - Owen (content)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user39",
      weight: 6,
    }, // Zainab - Scarlett (community)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user41",
      weight: 9,
    }, // Zainab - Madeline (science)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user49",
      weight: 6,
    }, // Zainab - Naomi (DAO tooling)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user1",
      weight: 5,
    }, // Zainab - Emma (governance)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user5",
      weight: 4,
    }, // Zainab - Ava (design)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 7,
    }, // Zainab - Eliza (climate)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 6,
    }, // Zainab - Amara (creator economy)

    // Connections for Marcus Wheeler (Real Estate)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user3",
      weight: 6,
    }, // Marcus - Olivia (tokenomics)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user9",
      weight: 7,
    }, // Marcus - Isabella (economics)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user24",
      weight: 8,
    }, // Marcus - Daniel (stable assets)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user26",
      weight: 7,
    }, // Marcus - Matthew (legal)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user33",
      weight: 6,
    }, // Marcus - Hazel (insurance)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user35",
      weight: 8,
    }, // Marcus - Chloe (lending)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user44",
      weight: 9,
    }, // Marcus - Miles (real estate)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user1",
      weight: 4,
    }, // Marcus - Emma (governance)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user10",
      weight: 6,
    }, // Marcus - Logan (defi)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user2",
      weight: 5,
    }, // Marcus - Liam (smart contracts)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 7,
    }, // Marcus - Jin (DeFi)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 5,
    }, // Marcus - Eliza (climate finance)

    // Connections for Jin Park (DeFi Architect)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user2",
      weight: 7,
    }, // Jin - Liam (smart contracts)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user3",
      weight: 6,
    }, // Jin - Olivia (tokenomics)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user10",
      weight: 9,
    }, // Jin - Logan (DeFi)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user19",
      weight: 8,
    }, // Jin - Evelyn (exchanges)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user24",
      weight: 7,
    }, // Jin - Daniel (stablecoins)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user35",
      weight: 9,
    }, // Jin - Chloe (lending)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user42",
      weight: 7,
    }, // Jin - Julian (derivatives)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user50",
      weight: 8,
    }, // Jin - Theo (liquid staking)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user1",
      weight: 5,
    }, // Jin - Emma (blockchain)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user18",
      weight: 6,
    }, // Jin - Henry (security)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user28",
      weight: 5,
    }, // Jin - Leo (bridges)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "e55075ef-3076-4019-bb46-854ab2662da1",
      weight: 6,
    }, // Jin - Angela (smart contracts)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      weight: 8,
    }, // Jin - Raj (MEV)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 7,
    }, // Jin - Hiroshi (bridges)

    // Connections for Eliza Cortez (Climate Finance)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user25",
      weight: 9,
    }, // Eliza - Zoe (climate)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user31",
      weight: 6,
    }, // Eliza - Stella (data)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user33",
      weight: 7,
    }, // Eliza - Hazel (risk)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user35",
      weight: 6,
    }, // Eliza - Chloe (lending)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user41",
      weight: 7,
    }, // Eliza - Madeline (research)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user3",
      weight: 5,
    }, // Eliza - Olivia (mechanism design)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user9",
      weight: 6,
    }, // Eliza - Isabella (economics)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user1",
      weight: 4,
    }, // Eliza - Emma (governance)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user10",
      weight: 5,
    }, // Eliza - Logan (trading)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user47",
      weight: 6,
    }, // Eliza - Ruby (social tokens)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 7,
    }, // Eliza - Zainab (science)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 5,
    }, // Eliza - Marcus (real estate)

    // Connections for Jamal Edwards (Identity Systems)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user14",
      weight: 9,
    }, // Jamal - Aiden (identity)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user15",
      weight: 8,
    }, // Jamal - Charlotte (social trust)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user40",
      weight: 7,
    }, // Jamal - Levi (privacy)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user48",
      weight: 9,
    }, // Jamal - Ezra (identity)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user12",
      weight: 7,
    }, // Jamal - Jackson (encryption)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user18",
      weight: 6,
    }, // Jamal - Henry (security)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user26",
      weight: 7,
    }, // Jamal - Matthew (legal)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user1",
      weight: 4,
    }, // Jamal - Emma (governance)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user4",
      weight: 6,
    }, // Jamal - Noah (cryptography)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user22",
      weight: 6,
    }, // Jamal - Sebastian (wallets)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      weight: 9,
    }, // Jamal - Carmen (regulatory)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      weight: 8,
    }, // Jamal - Feng (privacy)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "e55075ef-3076-4019-bb46-854ab2662da1",
      weight: 5,
    }, // Jamal - Angela (security)

    // Connections for Amara Okafor (Social Platform Architect)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user7",
      weight: 8,
    }, // Amara - Sophia (community)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user15",
      weight: 7,
    }, // Amara - Charlotte (social)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user17",
      weight: 7,
    }, // Amara - Amelia (virtual worlds)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user21",
      weight: 6,
    }, // Amara - Abigail (education)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user23",
      weight: 7,
    }, // Amara - Lily (music)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user27",
      weight: 8,
    }, // Amara - Victoria (gaming)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user34",
      weight: 9,
    }, // Amara - Owen (content)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user39",
      weight: 8,
    }, // Amara - Scarlett (community)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user43",
      weight: 7,
    }, // Amara - Eleanor (curator)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user47",
      weight: 9,
    }, // Amara - Ruby (social tokens)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user5",
      weight: 7,
    }, // Amara - Ava (design)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user6",
      weight: 6,
    }, // Amara - Ethan (digital art)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 6,
    }, // Amara - Zainab (research)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      weight: 4,
    }, // Amara - Carmen (regulatory)

    // Connections for Hiroshi Tanaka (Bridge Protocol Engineer)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user1",
      weight: 5,
    }, // Hiroshi - Emma (blockchain)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user2",
      weight: 6,
    }, // Hiroshi - Liam (smart contracts)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user4",
      weight: 7,
    }, // Hiroshi - Noah (cryptography)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user8",
      weight: 8,
    }, // Hiroshi - Mason (infrastructure)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user13",
      weight: 8,
    }, // Hiroshi - Sofia (layer2)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user16",
      weight: 6,
    }, // Hiroshi - Lucas (oracles)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user18",
      weight: 6,
    }, // Hiroshi - Henry (security)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user28",
      weight: 9,
    }, // Hiroshi - Leo (bridges)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user32",
      weight: 7,
    }, // Hiroshi - Zachary (hardware)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user38",
      weight: 7,
    }, // Hiroshi - Gabriel (APIs)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user46",
      weight: 6,
    }, // Hiroshi - Max (compute)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      weight: 7,
    }, // Hiroshi - Sasha (protocols)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 7,
    }, // Hiroshi - Jin (DeFi)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "e55075ef-3076-4019-bb46-854ab2662da1",
      weight: 5,
    }, // Hiroshi - Angela (smart contracts)

    // Additional connections between UUID nodes that aren't already connected
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      weight: 5,
    }, // Sasha - Carmen (protocol compliance)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 4,
    }, // Sasha - Zainab (science infrastructure)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 3,
    }, // Sasha - Marcus (real estate tokenization)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 4,
    }, // Sasha - Eliza (climate systems)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 6,
    }, // Sasha - Jamal (identity protocols)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 5,
    }, // Sasha - Amara (social platforms)

    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      weight: 6,
    }, // Raj - Carmen (regulatory MEV)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      weight: 7,
    }, // Raj - Feng (zkproofs for MEV)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 3,
    }, // Raj - Zainab (research collaboration)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 4,
    }, // Raj - Marcus (real estate markets)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 4,
    }, // Raj - Eliza (carbon markets)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 5,
    }, // Raj - Jamal (identity verification)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 5,
    }, // Raj - Amara (creator economies)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 6,
    }, // Raj - Hiroshi (cross-chain trading)

    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      weight: 7,
    }, // Carmen - Feng (privacy regulations)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 5,
    }, // Carmen - Zainab (research compliance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 7,
    }, // Carmen - Marcus (real estate regulations)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 6,
    }, // Carmen - Jin (DeFi compliance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 5,
    }, // Carmen - Eliza (carbon credit compliance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 6,
    }, // Carmen - Hiroshi (cross-border regulations)

    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      weight: 6,
    }, // Feng - Zainab (science verification)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 5,
    }, // Feng - Marcus (property verification)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 7,
    }, // Feng - Jin (DeFi privacy)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 4,
    }, // Feng - Eliza (climate data verification)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 5,
    }, // Feng - Amara (private social data)

    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "741613d6-10dc-4551-b686-39ad00470c95",
      weight: 4,
    }, // Zainab - Marcus (science funding)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      weight: 5,
    }, // Zainab - Jin (research funding)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 6,
    }, // Zainab - Jamal (research identity)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 4,
    }, // Zainab - Hiroshi (cross-institution collaboration)

    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 5,
    }, // Marcus - Jamal (property identity)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 4,
    }, // Marcus - Amara (property social platforms)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 6,
    }, // Marcus - Hiroshi (cross-border real estate)

    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      weight: 7,
    }, // Jin - Eliza (climate finance)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 6,
    }, // Jin - Jamal (DeFi identity)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 5,
    }, // Jin - Amara (creator finance)

    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      weight: 4,
    }, // Eliza - Jamal (climate identity)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 6,
    }, // Eliza - Amara (climate communities)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 5,
    }, // Eliza - Hiroshi (global climate collaboration)

    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      weight: 8,
    }, // Jamal - Amara (social identity)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 5,
    }, // Jamal - Hiroshi (cross-chain identity)

    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      weight: 4,
    }, // Amara - Hiroshi (cross-platform social)

    // Additional connections to existing nodes
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user36",
      weight: 6,
    }, // Sasha - Elijah (storage protocols)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user19",
      weight: 5,
    }, // Sasha - Evelyn (exchange protocols)
    {
      source: "1be8abfd-604d-4eb0-92a9-eff597c15ed9",
      target: "user37",
      weight: 7,
    }, // Sasha - Audrey (payment protocols)

    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user16",
      weight: 6,
    }, // Raj - Lucas (oracle data)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user20",
      weight: 7,
    }, // Raj - Wyatt (staking incentives)
    {
      source: "2ece21f3-bf25-4980-b17b-4dfc5794839d",
      target: "user27",
      weight: 5,
    }, // Raj - Victoria (game economies)

    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user31",
      weight: 6,
    }, // Carmen - Stella (data governance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user37",
      weight: 8,
    }, // Carmen - Audrey (payment compliance)
    {
      source: "30f033be-3cb4-42a8-9772-df26583bdc0a",
      target: "user27",
      weight: 5,
    }, // Carmen - Victoria (gaming regulation)

    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user31",
      weight: 7,
    }, // Feng - Stella (data privacy)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user19",
      weight: 6,
    }, // Feng - Evelyn (private trading)
    {
      source: "4449d0b5-bb48-4992-9c3c-0dd6b14653cd",
      target: "user37",
      weight: 6,
    }, // Feng - Audrey (private payments)

    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user23",
      weight: 5,
    }, // Zainab - Lily (research publication)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user27",
      weight: 6,
    }, // Zainab - Victoria (science games)
    {
      source: "586e8237-e741-4656-bd77-b6ab2e7ae4b5",
      target: "user45",
      weight: 7,
    }, // Zainab - Violet (accessible science)

    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user20",
      weight: 7,
    }, // Marcus - Wyatt (real estate staking)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user42",
      weight: 6,
    }, // Marcus - Julian (property derivatives)
    {
      source: "741613d6-10dc-4551-b686-39ad00470c95",
      target: "user11",
      weight: 5,
    }, // Marcus - Mia (property governance)

    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user16",
      weight: 7,
    }, // Jin - Lucas (DeFi oracles)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user11",
      weight: 5,
    }, // Jin - Mia (DeFi governance)
    {
      source: "8a96b4a8-1a33-458b-a377-84f598ce65fd",
      target: "user37",
      weight: 8,
    }, // Jin - Audrey (payment integration)

    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user11",
      weight: 5,
    }, // Eliza - Mia (climate governance)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user16",
      weight: 6,
    }, // Eliza - Lucas (climate oracles)
    {
      source: "958bac7f-cdad-44f8-bb0d-9eab67cdca86",
      target: "user27",
      weight: 5,
    }, // Eliza - Victoria (climate gamification)

    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user30",
      weight: 7,
    }, // Jamal - Caleb (mobile identity)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user11",
      weight: 6,
    }, // Jamal - Mia (identity governance)
    {
      source: "c53da3e9-28ad-4c3e-9868-bc8fbd68d8fb",
      target: "user37",
      weight: 8,
    }, // Jamal - Audrey (payment identity)

    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user30",
      weight: 8,
    }, // Amara - Caleb (mobile social)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user11",
      weight: 6,
    }, // Amara - Mia (social governance)
    {
      source: "dc9404c9-d399-454a-9e1b-2f69da5c96aa",
      target: "user45",
      weight: 7,
    }, // Amara - Violet (accessible social)

    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user19",
      weight: 6,
    }, // Hiroshi - Evelyn (exchange bridges)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user20",
      weight: 7,
    }, // Hiroshi - Wyatt (staking bridges)
    {
      source: "fca6e3ab-4c56-460e-b488-cbab1926e6e3",
      target: "user11",
      weight: 5,
    }, // Hiroshi - Mia (bridge governance)

    // Generate programmatically with the following pattern:
    // Group 1 strong connections (nodes 1-10)
    { source: "user1", target: "user2", weight: 8 },
    { source: "user1", target: "user3", weight: 7 },
    { source: "user1", target: "user4", weight: 6 },
    { source: "user1", target: "user5", weight: 7 },
    { source: "user1", target: "user6", weight: 5 },
    { source: "user1", target: "user7", weight: 6 },
    { source: "user1", target: "user8", weight: 4 },
    { source: "user1", target: "user9", weight: 5 },
    { source: "user1", target: "user10", weight: 3 },
    { source: "user2", target: "user3", weight: 9 },
    { source: "user2", target: "user4", weight: 8 },
    { source: "user2", target: "user5", weight: 6 },
    { source: "user2", target: "user6", weight: 7 },
    { source: "user2", target: "user7", weight: 5 },
    { source: "user2", target: "user8", weight: 6 },
    { source: "user2", target: "user9", weight: 4 },
    { source: "user2", target: "user10", weight: 5 },
    { source: "user3", target: "user4", weight: 8 },
    { source: "user3", target: "user5", weight: 7 },
    { source: "user3", target: "user6", weight: 6 },
    { source: "user3", target: "user7", weight: 5 },
    { source: "user3", target: "user8", weight: 7 },
    { source: "user3", target: "user9", weight: 6 },
    { source: "user3", target: "user10", weight: 4 },
    { source: "user4", target: "user5", weight: 6 },
    { source: "user4", target: "user6", weight: 5 },
    { source: "user4", target: "user7", weight: 7 },
    { source: "user4", target: "user8", weight: 6 },
    { source: "user4", target: "user9", weight: 5 },
    { source: "user4", target: "user10", weight: 4 },
    { source: "user5", target: "user6", weight: 7 },
    { source: "user5", target: "user7", weight: 8 },
    { source: "user5", target: "user8", weight: 6 },
    { source: "user5", target: "user9", weight: 5 },
    { source: "user5", target: "user10", weight: 7 },
    { source: "user6", target: "user7", weight: 6 },
    { source: "user6", target: "user8", weight: 5 },
    { source: "user6", target: "user9", weight: 4 },
    { source: "user6", target: "user10", weight: 6 },
    { source: "user7", target: "user8", weight: 8 },
    { source: "user7", target: "user9", weight: 7 },
    { source: "user7", target: "user10", weight: 5 },
    { source: "user8", target: "user9", weight: 6 },
    { source: "user8", target: "user10", weight: 5 },
    { source: "user9", target: "user10", weight: 7 },

    // Group 2 strong connections (nodes 11-20)
    { source: "user11", target: "user12", weight: 8 },
    { source: "user11", target: "user13", weight: 7 },
    { source: "user11", target: "user14", weight: 6 },
    { source: "user11", target: "user15", weight: 7 },
    { source: "user11", target: "user16", weight: 5 },
    { source: "user11", target: "user17", weight: 6 },
    { source: "user11", target: "user18", weight: 4 },
    { source: "user11", target: "user19", weight: 5 },
    { source: "user11", target: "user20", weight: 3 },
    { source: "user12", target: "user13", weight: 9 },
    { source: "user12", target: "user14", weight: 8 },
    { source: "user12", target: "user15", weight: 6 },
    { source: "user12", target: "user16", weight: 7 },
    { source: "user12", target: "user17", weight: 5 },
    { source: "user12", target: "user18", weight: 6 },
    { source: "user12", target: "user19", weight: 4 },
    { source: "user12", target: "user20", weight: 5 },
    { source: "user13", target: "user14", weight: 8 },
    { source: "user13", target: "user15", weight: 7 },
    { source: "user13", target: "user16", weight: 6 },
    { source: "user13", target: "user17", weight: 5 },
    { source: "user13", target: "user18", weight: 7 },
    { source: "user13", target: "user19", weight: 6 },
    { source: "user13", target: "user20", weight: 4 },
    { source: "user14", target: "user15", weight: 6 },
    { source: "user14", target: "user16", weight: 5 },
    { source: "user14", target: "user17", weight: 7 },
    { source: "user14", target: "user18", weight: 6 },
    { source: "user14", target: "user19", weight: 5 },
    { source: "user14", target: "user20", weight: 4 },
    { source: "user15", target: "user16", weight: 7 },
    { source: "user15", target: "user17", weight: 8 },
    { source: "user15", target: "user18", weight: 6 },
    { source: "user15", target: "user19", weight: 5 },
    { source: "user15", target: "user20", weight: 7 },
    { source: "user16", target: "user17", weight: 6 },
    { source: "user16", target: "user18", weight: 5 },
    { source: "user16", target: "user19", weight: 4 },
    { source: "user16", target: "user20", weight: 6 },
    { source: "user17", target: "user18", weight: 8 },
    { source: "user17", target: "user19", weight: 7 },
    { source: "user17", target: "user20", weight: 5 },
    { source: "user18", target: "user19", weight: 6 },
    { source: "user18", target: "user20", weight: 5 },
    { source: "user19", target: "user20", weight: 7 },

    // Group 3 strong connections (nodes 21-30)
    { source: "user21", target: "user22", weight: 8 },
    { source: "user21", target: "user23", weight: 7 },
    { source: "user21", target: "user24", weight: 6 },
    { source: "user21", target: "user25", weight: 7 },
    { source: "user21", target: "user26", weight: 5 },
    { source: "user21", target: "user27", weight: 6 },
    { source: "user21", target: "user28", weight: 4 },
    { source: "user21", target: "user29", weight: 5 },
    { source: "user21", target: "user30", weight: 3 },
    { source: "user22", target: "user23", weight: 9 },
    { source: "user22", target: "user24", weight: 8 },
    { source: "user22", target: "user25", weight: 6 },
    { source: "user22", target: "user26", weight: 7 },
    { source: "user22", target: "user27", weight: 5 },
    { source: "user22", target: "user28", weight: 6 },
    { source: "user22", target: "user29", weight: 4 },
    { source: "user22", target: "user30", weight: 5 },
    { source: "user23", target: "user24", weight: 8 },
    { source: "user23", target: "user25", weight: 7 },
    { source: "user23", target: "user26", weight: 6 },
    { source: "user23", target: "user27", weight: 5 },
    { source: "user23", target: "user28", weight: 7 },
    { source: "user23", target: "user29", weight: 6 },
    { source: "user23", target: "user30", weight: 4 },
    { source: "user24", target: "user25", weight: 6 },
    { source: "user24", target: "user26", weight: 5 },
    { source: "user24", target: "user27", weight: 7 },
    { source: "user24", target: "user28", weight: 6 },
    { source: "user24", target: "user29", weight: 5 },
    { source: "user24", target: "user30", weight: 4 },
    { source: "user25", target: "user26", weight: 7 },
    { source: "user25", target: "user27", weight: 8 },
    { source: "user25", target: "user28", weight: 6 },
    { source: "user25", target: "user29", weight: 5 },
    { source: "user25", target: "user30", weight: 7 },
    { source: "user26", target: "user27", weight: 6 },
    { source: "user26", target: "user28", weight: 5 },
    { source: "user26", target: "user29", weight: 4 },
    { source: "user26", target: "user30", weight: 6 },
    { source: "user27", target: "user28", weight: 8 },
    { source: "user27", target: "user29", weight: 7 },
    { source: "user27", target: "user30", weight: 5 },
    { source: "user28", target: "user29", weight: 6 },
    { source: "user28", target: "user30", weight: 5 },
    { source: "user29", target: "user30", weight: 7 },

    // Group 4 strong connections (nodes 31-40)
    { source: "user31", target: "user32", weight: 8 },
    { source: "user31", target: "user33", weight: 7 },
    { source: "user31", target: "user34", weight: 6 },
    { source: "user31", target: "user35", weight: 7 },
    { source: "user31", target: "user36", weight: 5 },
    { source: "user31", target: "user37", weight: 6 },
    { source: "user31", target: "user38", weight: 4 },
    { source: "user31", target: "user39", weight: 5 },
    { source: "user31", target: "user40", weight: 3 },
    { source: "user32", target: "user33", weight: 9 },
    { source: "user32", target: "user34", weight: 8 },
    { source: "user32", target: "user35", weight: 6 },
    { source: "user32", target: "user36", weight: 7 },
    { source: "user32", target: "user37", weight: 5 },
    { source: "user32", target: "user38", weight: 6 },
    { source: "user32", target: "user39", weight: 4 },
    { source: "user32", target: "user40", weight: 5 },
    { source: "user33", target: "user34", weight: 8 },
    { source: "user33", target: "user35", weight: 7 },
    { source: "user33", target: "user36", weight: 6 },
    { source: "user33", target: "user37", weight: 5 },
    { source: "user33", target: "user38", weight: 7 },
    { source: "user33", target: "user39", weight: 6 },
    { source: "user33", target: "user40", weight: 4 },
    { source: "user34", target: "user35", weight: 6 },
    { source: "user34", target: "user36", weight: 5 },
    { source: "user34", target: "user37", weight: 7 },
    { source: "user34", target: "user38", weight: 6 },
    { source: "user34", target: "user39", weight: 5 },
    { source: "user34", target: "user40", weight: 4 },
    { source: "user35", target: "user36", weight: 7 },
    { source: "user35", target: "user37", weight: 8 },
    { source: "user35", target: "user38", weight: 6 },
    { source: "user35", target: "user39", weight: 5 },
    { source: "user35", target: "user40", weight: 7 },
    { source: "user36", target: "user37", weight: 6 },
    { source: "user36", target: "user38", weight: 5 },
    { source: "user36", target: "user39", weight: 4 },
    { source: "user36", target: "user40", weight: 6 },
    { source: "user37", target: "user38", weight: 8 },
    { source: "user37", target: "user39", weight: 7 },
    { source: "user37", target: "user40", weight: 5 },
    { source: "user38", target: "user39", weight: 6 },
    { source: "user38", target: "user40", weight: 5 },
    { source: "user39", target: "user40", weight: 7 },

    // Group 5 strong connections (nodes 41-50)
    { source: "user41", target: "user42", weight: 8 },
    { source: "user41", target: "user43", weight: 7 },
    { source: "user41", target: "user44", weight: 6 },
    { source: "user41", target: "user45", weight: 7 },
    { source: "user41", target: "user46", weight: 5 },
    { source: "user41", target: "user47", weight: 6 },
    { source: "user41", target: "user48", weight: 4 },
    { source: "user41", target: "user49", weight: 5 },
    { source: "user41", target: "user50", weight: 3 },
    { source: "user42", target: "user43", weight: 9 },
    { source: "user42", target: "user44", weight: 8 },
    { source: "user42", target: "user45", weight: 6 },
    { source: "user42", target: "user46", weight: 7 },
    { source: "user42", target: "user47", weight: 5 },
    { source: "user42", target: "user48", weight: 6 },
    { source: "user42", target: "user49", weight: 4 },
    { source: "user42", target: "user50", weight: 5 },
    { source: "user43", target: "user44", weight: 8 },
    { source: "user43", target: "user45", weight: 7 },
    { source: "user43", target: "user46", weight: 6 },
    { source: "user43", target: "user47", weight: 5 },
    { source: "user43", target: "user48", weight: 7 },
    { source: "user43", target: "user49", weight: 6 },
    { source: "user43", target: "user50", weight: 4 },
    { source: "user44", target: "user45", weight: 6 },
    { source: "user44", target: "user46", weight: 5 },
    { source: "user44", target: "user47", weight: 7 },
    { source: "user44", target: "user48", weight: 6 },
    { source: "user44", target: "user49", weight: 5 },
    { source: "user44", target: "user50", weight: 4 },
    { source: "user45", target: "user46", weight: 7 },
    { source: "user45", target: "user47", weight: 8 },
    { source: "user45", target: "user48", weight: 6 },
    { source: "user45", target: "user49", weight: 5 },
    { source: "user45", target: "user50", weight: 7 },
    { source: "user46", target: "user47", weight: 6 },
    { source: "user46", target: "user48", weight: 5 },
    { source: "user46", target: "user49", weight: 4 },
    { source: "user46", target: "user50", weight: 6 },
    { source: "user47", target: "user48", weight: 8 },
    { source: "user47", target: "user49", weight: 7 },
    { source: "user47", target: "user50", weight: 5 },
    { source: "user48", target: "user49", weight: 6 },
    { source: "user48", target: "user50", weight: 5 },
    { source: "user49", target: "user50", weight: 7 },

    // Cross-group connections - bridging communities
    // Group 1 to Group 2 (select bridges)
    { source: "user1", target: "user11", weight: 3 },
    { source: "user3", target: "user13", weight: 4 },
    { source: "user5", target: "user15", weight: 3 },
    { source: "user7", target: "user17", weight: 4 },
    { source: "user9", target: "user19", weight: 2 },
    { source: "user2", target: "user12", weight: 3 },
    { source: "user4", target: "user14", weight: 2 },
    { source: "user6", target: "user16", weight: 3 },
    { source: "user8", target: "user18", weight: 2 },
    { source: "user10", target: "user20", weight: 3 },

    // Group 2 to Group 3 (select bridges)
    { source: "user11", target: "user21", weight: 3 },
    { source: "user13", target: "user23", weight: 4 },
    { source: "user15", target: "user25", weight: 3 },
    { source: "user17", target: "user27", weight: 4 },
    { source: "user19", target: "user29", weight: 2 },
    { source: "user12", target: "user22", weight: 3 },
    { source: "user14", target: "user24", weight: 2 },
    { source: "user16", target: "user26", weight: 3 },
    { source: "user18", target: "user28", weight: 2 },
    { source: "user20", target: "user30", weight: 3 },

    // Group 3 to Group 4 (select bridges)
    { source: "user21", target: "user31", weight: 3 },
    { source: "user23", target: "user33", weight: 4 },
    { source: "user25", target: "user35", weight: 3 },
    { source: "user27", target: "user37", weight: 4 },
    { source: "user29", target: "user39", weight: 2 },
    { source: "user22", target: "user32", weight: 3 },
    { source: "user24", target: "user34", weight: 2 },
    { source: "user26", target: "user36", weight: 3 },
    { source: "user28", target: "user38", weight: 2 },
    { source: "user30", target: "user40", weight: 3 },

    // Group 4 to Group 5 (select bridges)
    { source: "user31", target: "user41", weight: 3 },
    { source: "user33", target: "user43", weight: 4 },
    { source: "user35", target: "user45", weight: 3 },
    { source: "user37", target: "user47", weight: 4 },
    { source: "user39", target: "user49", weight: 2 },
    { source: "user32", target: "user42", weight: 3 },
    { source: "user34", target: "user44", weight: 2 },
    { source: "user36", target: "user46", weight: 3 },
    { source: "user38", target: "user48", weight: 2 },
    { source: "user40", target: "user50", weight: 3 },

    // Group 5 to Group 1 (wrapping around - select bridges to close the loop)
    { source: "user41", target: "user1", weight: 3 },
    { source: "user43", target: "user3", weight: 4 },
    { source: "user45", target: "user5", weight: 3 },
    { source: "user47", target: "user7", weight: 4 },
    { source: "user49", target: "user9", weight: 2 },
    { source: "user42", target: "user2", weight: 3 },
    { source: "user44", target: "user4", weight: 2 },
    { source: "user46", target: "user6", weight: 3 },
    { source: "user48", target: "user8", weight: 2 },
    { source: "user50", target: "user10", weight: 3 },

    // Long-range connections (connecting distant groups)
    // Group 1 to Group 3
    { source: "user1", target: "user21", weight: 2 },
    { source: "user1", target: "user22", weight: 1 },
    { source: "user1", target: "user23", weight: 2 },
    { source: "user1", target: "user24", weight: 1 },
    { source: "user1", target: "user25", weight: 2 },
    { source: "user2", target: "user26", weight: 1 },
    { source: "user2", target: "user27", weight: 2 },
    { source: "user2", target: "user28", weight: 1 },
    { source: "user2", target: "user29", weight: 2 },
    { source: "user2", target: "user30", weight: 1 },
    { source: "user3", target: "user21", weight: 2 },
    { source: "user3", target: "user22", weight: 1 },
    { source: "user3", target: "user23", weight: 2 },
    { source: "user3", target: "user24", weight: 1 },
    { source: "user3", target: "user25", weight: 2 },
    { source: "user4", target: "user26", weight: 1 },
    { source: "user4", target: "user27", weight: 2 },
    { source: "user4", target: "user28", weight: 1 },
    { source: "user4", target: "user29", weight: 2 },
    { source: "user4", target: "user30", weight: 1 },
    { source: "user5", target: "user21", weight: 2 },
    { source: "user5", target: "user22", weight: 1 },
    { source: "user5", target: "user23", weight: 2 },
    { source: "user5", target: "user24", weight: 1 },
    { source: "user5", target: "user25", weight: 2 },
    { source: "user6", target: "user26", weight: 1 },
    { source: "user6", target: "user27", weight: 2 },
    { source: "user6", target: "user28", weight: 1 },
    { source: "user6", target: "user29", weight: 2 },
    { source: "user6", target: "user30", weight: 1 },
    { source: "user7", target: "user21", weight: 2 },
    { source: "user7", target: "user22", weight: 1 },
    { source: "user7", target: "user23", weight: 2 },
    { source: "user7", target: "user24", weight: 1 },
    { source: "user7", target: "user25", weight: 2 },
    { source: "user8", target: "user26", weight: 1 },
    { source: "user8", target: "user27", weight: 2 },
    { source: "user8", target: "user28", weight: 1 },
    { source: "user8", target: "user29", weight: 2 },
    { source: "user8", target: "user30", weight: 1 },
    { source: "user9", target: "user21", weight: 2 },
    { source: "user9", target: "user22", weight: 1 },
    { source: "user9", target: "user23", weight: 2 },
    { source: "user9", target: "user24", weight: 1 },
    { source: "user9", target: "user25", weight: 2 },
    { source: "user10", target: "user26", weight: 1 },
    { source: "user10", target: "user27", weight: 2 },
    { source: "user10", target: "user28", weight: 1 },
    { source: "user10", target: "user29", weight: 2 },
    { source: "user10", target: "user30", weight: 1 },

    // Group 1 to Group 4
    { source: "user1", target: "user31", weight: 1 },
    { source: "user1", target: "user32", weight: 2 },
    { source: "user1", target: "user33", weight: 1 },
    { source: "user1", target: "user34", weight: 2 },
    { source: "user1", target: "user35", weight: 1 },
    { source: "user2", target: "user36", weight: 2 },
    { source: "user2", target: "user37", weight: 1 },
    { source: "user2", target: "user38", weight: 2 },
    { source: "user2", target: "user39", weight: 1 },
    { source: "user2", target: "user40", weight: 2 },
    { source: "user3", target: "user31", weight: 1 },
    { source: "user3", target: "user32", weight: 2 },
    { source: "user3", target: "user33", weight: 1 },
    { source: "user3", target: "user34", weight: 2 },
    { source: "user3", target: "user35", weight: 1 },
    { source: "user4", target: "user36", weight: 2 },
    { source: "user4", target: "user37", weight: 1 },
    { source: "user4", target: "user38", weight: 2 },
    { source: "user4", target: "user39", weight: 1 },
    { source: "user4", target: "user40", weight: 2 },
    { source: "user5", target: "user31", weight: 1 },
    { source: "user5", target: "user32", weight: 2 },
    { source: "user5", target: "user33", weight: 1 },
    { source: "user5", target: "user34", weight: 2 },
    { source: "user5", target: "user35", weight: 1 },
    { source: "user6", target: "user36", weight: 2 },
    { source: "user6", target: "user37", weight: 1 },
    { source: "user6", target: "user38", weight: 2 },
    { source: "user6", target: "user39", weight: 1 },
    { source: "user6", target: "user40", weight: 2 },
    { source: "user7", target: "user31", weight: 1 },
    { source: "user7", target: "user32", weight: 2 },
    { source: "user7", target: "user33", weight: 1 },
    { source: "user7", target: "user34", weight: 2 },
    { source: "user7", target: "user35", weight: 1 },
    { source: "user8", target: "user36", weight: 2 },
    { source: "user8", target: "user37", weight: 1 },
    { source: "user8", target: "user38", weight: 2 },
    { source: "user8", target: "user39", weight: 1 },
    { source: "user8", target: "user40", weight: 2 },
    { source: "user9", target: "user31", weight: 1 },
    { source: "user9", target: "user32", weight: 2 },
    { source: "user9", target: "user33", weight: 1 },
    { source: "user9", target: "user34", weight: 2 },
    { source: "user9", target: "user35", weight: 1 },
    { source: "user10", target: "user36", weight: 2 },
    { source: "user10", target: "user37", weight: 1 },
    { source: "user10", target: "user38", weight: 2 },
    { source: "user10", target: "user39", weight: 1 },
    { source: "user10", target: "user40", weight: 2 },

    // Group 1 to Group 5
    { source: "user1", target: "user41", weight: 2 },
    { source: "user1", target: "user42", weight: 1 },
    { source: "user1", target: "user43", weight: 2 },
    { source: "user1", target: "user44", weight: 1 },
    { source: "user1", target: "user45", weight: 2 },
    { source: "user2", target: "user46", weight: 1 },
    { source: "user2", target: "user47", weight: 2 },
    { source: "user2", target: "user48", weight: 1 },
    { source: "user2", target: "user49", weight: 2 },
    { source: "user2", target: "user50", weight: 1 },
    { source: "user3", target: "user41", weight: 2 },
    { source: "user3", target: "user42", weight: 1 },
    { source: "user3", target: "user43", weight: 2 },
    { source: "user3", target: "user44", weight: 1 },
    { source: "user3", target: "user45", weight: 2 },
    { source: "user4", target: "user46", weight: 1 },
    { source: "user4", target: "user47", weight: 2 },
    { source: "user4", target: "user48", weight: 1 },
    { source: "user4", target: "user49", weight: 2 },
    { source: "user4", target: "user50", weight: 1 },
    { source: "user5", target: "user41", weight: 2 },
    { source: "user5", target: "user42", weight: 1 },
    { source: "user5", target: "user43", weight: 2 },
    { source: "user5", target: "user44", weight: 1 },
    { source: "user5", target: "user45", weight: 2 },
    { source: "user6", target: "user46", weight: 1 },
    { source: "user6", target: "user47", weight: 2 },
    { source: "user6", target: "user48", weight: 1 },
    { source: "user6", target: "user49", weight: 2 },
    { source: "user6", target: "user50", weight: 1 },
    { source: "user7", target: "user41", weight: 2 },
    { source: "user7", target: "user42", weight: 1 },
    { source: "user7", target: "user43", weight: 2 },
    { source: "user7", target: "user44", weight: 1 },
    { source: "user7", target: "user45", weight: 2 },
    { source: "user8", target: "user46", weight: 1 },
    { source: "user8", target: "user47", weight: 2 },
    { source: "user8", target: "user48", weight: 1 },
    { source: "user8", target: "user49", weight: 2 },
    { source: "user8", target: "user50", weight: 1 },
    { source: "user9", target: "user41", weight: 2 },
    { source: "user9", target: "user42", weight: 1 },
    { source: "user9", target: "user43", weight: 2 },
    { source: "user9", target: "user44", weight: 1 },
    { source: "user9", target: "user45", weight: 2 },
    { source: "user10", target: "user46", weight: 1 },
    { source: "user10", target: "user47", weight: 2 },
    { source: "user10", target: "user48", weight: 1 },
    { source: "user10", target: "user49", weight: 2 },
    { source: "user10", target: "user50", weight: 1 },

    // Group 2 to Group 4
    { source: "user11", target: "user31", weight: 2 },
    { source: "user11", target: "user32", weight: 1 },
    { source: "user11", target: "user33", weight: 2 },
    { source: "user11", target: "user34", weight: 1 },
    { source: "user11", target: "user35", weight: 2 },
    { source: "user12", target: "user36", weight: 1 },
    { source: "user12", target: "user37", weight: 2 },
    { source: "user12", target: "user38", weight: 1 },
    { source: "user12", target: "user39", weight: 2 },
    { source: "user12", target: "user40", weight: 1 },
    { source: "user13", target: "user31", weight: 2 },
    { source: "user13", target: "user32", weight: 1 },
    { source: "user13", target: "user33", weight: 2 },
    { source: "user13", target: "user34", weight: 1 },
    { source: "user13", target: "user35", weight: 2 },
    { source: "user14", target: "user36", weight: 1 },
    { source: "user14", target: "user37", weight: 2 },
    { source: "user14", target: "user38", weight: 1 },
    { source: "user14", target: "user39", weight: 2 },
    { source: "user14", target: "user40", weight: 1 },
    { source: "user15", target: "user31", weight: 2 },
    { source: "user15", target: "user32", weight: 1 },
    { source: "user15", target: "user33", weight: 2 },
    { source: "user15", target: "user34", weight: 1 },
    { source: "user15", target: "user35", weight: 2 },
    { source: "user16", target: "user36", weight: 1 },
    { source: "user16", target: "user37", weight: 2 },
    { source: "user16", target: "user38", weight: 1 },
    { source: "user16", target: "user39", weight: 2 },
    { source: "user16", target: "user40", weight: 1 },
    { source: "user17", target: "user31", weight: 2 },
    { source: "user17", target: "user32", weight: 1 },
    { source: "user17", target: "user33", weight: 2 },
    { source: "user17", target: "user34", weight: 1 },
    { source: "user17", target: "user35", weight: 2 },
    { source: "user18", target: "user36", weight: 1 },
    { source: "user18", target: "user37", weight: 2 },
    { source: "user18", target: "user38", weight: 1 },
    { source: "user18", target: "user39", weight: 2 },
    { source: "user18", target: "user40", weight: 1 },
    { source: "user19", target: "user31", weight: 2 },
    { source: "user19", target: "user32", weight: 1 },
    { source: "user19", target: "user33", weight: 2 },
    { source: "user19", target: "user34", weight: 1 },
    { source: "user19", target: "user35", weight: 2 },
    { source: "user20", target: "user36", weight: 1 },
    { source: "user20", target: "user37", weight: 2 },
    { source: "user20", target: "user38", weight: 1 },
    { source: "user20", target: "user39", weight: 2 },
    { source: "user20", target: "user40", weight: 1 },

    // Group 2 to Group 5
    { source: "user11", target: "user41", weight: 2 },
    { source: "user11", target: "user42", weight: 1 },
    { source: "user11", target: "user43", weight: 2 },
    { source: "user11", target: "user44", weight: 1 },
    { source: "user11", target: "user45", weight: 2 },
    { source: "user12", target: "user46", weight: 1 },
    { source: "user12", target: "user47", weight: 2 },
    { source: "user12", target: "user48", weight: 1 },
    { source: "user12", target: "user49", weight: 2 },
    { source: "user12", target: "user50", weight: 1 },
    { source: "user13", target: "user41", weight: 2 },
    { source: "user13", target: "user42", weight: 1 },
    { source: "user13", target: "user43", weight: 2 },
    { source: "user13", target: "user44", weight: 1 },
    { source: "user13", target: "user45", weight: 2 },
    { source: "user14", target: "user46", weight: 1 },
    { source: "user14", target: "user47", weight: 2 },
    { source: "user14", target: "user48", weight: 1 },
    { source: "user14", target: "user49", weight: 2 },
    { source: "user14", target: "user50", weight: 1 },
    { source: "user15", target: "user41", weight: 2 },
    { source: "user15", target: "user42", weight: 1 },
    { source: "user15", target: "user43", weight: 2 },
    { source: "user15", target: "user44", weight: 1 },
    { source: "user15", target: "user45", weight: 2 },
    { source: "user16", target: "user46", weight: 1 },
    { source: "user16", target: "user47", weight: 2 },
    { source: "user16", target: "user48", weight: 1 },
    { source: "user16", target: "user49", weight: 2 },
    { source: "user16", target: "user50", weight: 1 },
    { source: "user17", target: "user41", weight: 2 },
    { source: "user17", target: "user42", weight: 1 },
    { source: "user17", target: "user43", weight: 2 },
    { source: "user17", target: "user44", weight: 1 },
    { source: "user17", target: "user45", weight: 2 },
    { source: "user18", target: "user46", weight: 1 },
    { source: "user18", target: "user47", weight: 2 },
    { source: "user18", target: "user48", weight: 1 },
    { source: "user18", target: "user49", weight: 2 },
    { source: "user18", target: "user50", weight: 1 },
    { source: "user19", target: "user41", weight: 2 },
    { source: "user19", target: "user42", weight: 1 },
    { source: "user19", target: "user43", weight: 2 },
    { source: "user19", target: "user44", weight: 1 },
    { source: "user19", target: "user45", weight: 2 },
    { source: "user20", target: "user46", weight: 1 },
    { source: "user20", target: "user47", weight: 2 },
    { source: "user20", target: "user48", weight: 1 },
    { source: "user20", target: "user49", weight: 2 },
    { source: "user20", target: "user50", weight: 1 },

    { source: "user20", target: "user49", weight: 2 },
    { source: "user20", target: "user50", weight: 1 },

    // Group 3 to Group 5
    { source: "user21", target: "user41", weight: 2 },
    { source: "user21", target: "user42", weight: 1 },
    { source: "user21", target: "user43", weight: 2 },
    { source: "user21", target: "user44", weight: 1 },
    { source: "user21", target: "user45", weight: 2 },
    { source: "user22", target: "user46", weight: 1 },
    { source: "user22", target: "user47", weight: 2 },
    { source: "user22", target: "user48", weight: 1 },
    { source: "user22", target: "user49", weight: 2 },
    { source: "user22", target: "user50", weight: 1 },
    { source: "user23", target: "user41", weight: 2 },
    { source: "user23", target: "user42", weight: 1 },
    { source: "user23", target: "user43", weight: 2 },
    { source: "user23", target: "user44", weight: 1 },
    { source: "user23", target: "user45", weight: 2 },
    { source: "user24", target: "user46", weight: 1 },
    { source: "user24", target: "user47", weight: 2 },
    { source: "user24", target: "user48", weight: 1 },
    { source: "user24", target: "user49", weight: 2 },
    { source: "user24", target: "user50", weight: 1 },
    { source: "user25", target: "user41", weight: 2 },
    { source: "user25", target: "user42", weight: 1 },
    { source: "user25", target: "user43", weight: 2 },
    { source: "user25", target: "user44", weight: 1 },
    { source: "user25", target: "user45", weight: 2 },
    { source: "user26", target: "user46", weight: 1 },
    { source: "user26", target: "user47", weight: 2 },
    { source: "user26", target: "user48", weight: 1 },
    { source: "user26", target: "user49", weight: 2 },
    { source: "user26", target: "user50", weight: 1 },
    { source: "user27", target: "user41", weight: 2 },
    { source: "user27", target: "user42", weight: 1 },
    { source: "user27", target: "user43", weight: 2 },
    { source: "user27", target: "user44", weight: 1 },
    { source: "user27", target: "user45", weight: 2 },
    { source: "user28", target: "user46", weight: 1 },
    { source: "user28", target: "user47", weight: 2 },
    { source: "user28", target: "user48", weight: 1 },
    { source: "user28", target: "user49", weight: 2 },
    { source: "user28", target: "user50", weight: 1 },
    { source: "user29", target: "user41", weight: 2 },
    { source: "user29", target: "user42", weight: 1 },
    { source: "user29", target: "user43", weight: 2 },
    { source: "user29", target: "user44", weight: 1 },
    { source: "user29", target: "user45", weight: 2 },
    { source: "user30", target: "user46", weight: 1 },
    { source: "user30", target: "user47", weight: 2 },
    { source: "user30", target: "user48", weight: 1 },
    { source: "user30", target: "user49", weight: 2 },
    { source: "user30", target: "user50", weight: 1 },

    // Topic-based connections (users with similar interests but in different groups)
    // Blockchain/Governance interest connections
    { source: "user1", target: "user11", weight: 4 }, // Emma - Mia (blockchain governance connection)
    { source: "user1", target: "user26", weight: 3 }, // Emma - Matthew (blockchain governance + legal)
    { source: "user1", target: "user45", weight: 3 }, // Emma - Violet (blockchain + UX connection)
    { source: "user1", target: "user49", weight: 4 }, // Emma - Naomi (governance connection)
    { source: "user11", target: "user26", weight: 5 }, // Mia - Matthew (governance + legal)
    { source: "user11", target: "user49", weight: 6 }, // Mia - Naomi (governance connection)
    { source: "user26", target: "user49", weight: 5 }, // Matthew - Naomi (legal + governance)

    // Smart Contracts/Security interest connections
    { source: "user2", target: "user18", weight: 5 }, // Liam - Henry (security connection)
    { source: "user2", target: "user40", weight: 4 }, // Liam - Levi (privacy + security)
    { source: "user18", target: "user40", weight: 5 }, // Henry - Levi (security + privacy)

    // DAO/Economics interest connections
    { source: "user3", target: "user11", weight: 6 }, // Olivia - Mia (DAO connection)
    { source: "user3", target: "user25", weight: 4 }, // Olivia - Zoe (economics + climate)
    { source: "user3", target: "user31", weight: 5 }, // Olivia - Stella (DAO connection)
    { source: "user3", target: "user49", weight: 6 }, // Olivia - Naomi (DAO connection)
    { source: "user9", target: "user25", weight: 4 }, // Isabella - Zoe (economics connection)
    { source: "user11", target: "user31", weight: 5 }, // Mia - Stella (DAO data connection)
    { source: "user11", target: "user49", weight: 6 }, // Mia - Naomi (DAO connection)
    { source: "user31", target: "user49", weight: 5 }, // Stella - Naomi (Data DAO connection)

    // Privacy/Security interest connections
    { source: "user4", target: "user12", weight: 5 }, // Noah - Jackson (privacy connection)
    { source: "user4", target: "user18", weight: 4 }, // Noah - Henry (security connection)
    { source: "user4", target: "user40", weight: 6 }, // Noah - Levi (privacy connection)
    { source: "user12", target: "user18", weight: 4 }, // Jackson - Henry (privacy + security)
    { source: "user12", target: "user40", weight: 6 }, // Jackson - Levi (privacy connection)
    { source: "user18", target: "user40", weight: 5 }, // Henry - Levi (security + privacy)

    // Frontend/Design interest connections
    { source: "user5", target: "user17", weight: 5 }, // Ava - Amelia (UX + virtual worlds)
    { source: "user5", target: "user30", weight: 6 }, // Ava - Caleb (UX + mobile connection)
    { source: "user5", target: "user45", weight: 7 }, // Ava - Violet (UX + accessibility)
    { source: "user17", target: "user30", weight: 5 }, // Amelia - Caleb (virtual + mobile)
    { source: "user17", target: "user45", weight: 4 }, // Amelia - Violet (virtual + UX)
    { source: "user30", target: "user45", weight: 6 }, // Caleb - Violet (mobile + UX)

    // NFT/Art interest connections
    { source: "user6", target: "user23", weight: 6 }, // Ethan - Lily (NFT + music)
    { source: "user6", target: "user27", weight: 7 }, // Ethan - Victoria (NFT + gaming)
    { source: "user6", target: "user43", weight: 8 }, // Ethan - Eleanor (art connection)
    { source: "user23", target: "user27", weight: 5 }, // Lily - Victoria (music + gaming)
    { source: "user23", target: "user43", weight: 6 }, // Lily - Eleanor (music + art)
    { source: "user27", target: "user43", weight: 5 }, // Victoria - Eleanor (gaming + art)

    // Community/Education interest connections
    { source: "user7", target: "user21", weight: 7 }, // Sophia - Abigail (education connection)
    { source: "user7", target: "user39", weight: 8 }, // Sophia - Scarlett (community connection)
    { source: "user7", target: "user47", weight: 6 }, // Sophia - Ruby (community + tokens)
    { source: "user21", target: "user39", weight: 6 }, // Abigail - Scarlett (education + community)
    { source: "user21", target: "user47", weight: 5 }, // Abigail - Ruby (education + creator economy)
    { source: "user39", target: "user47", weight: 7 }, // Scarlett - Ruby (community + creator tokens)

    // Infrastructure/DevOps interest connections
    { source: "user8", target: "user32", weight: 6 }, // Mason - Zachary (infrastructure + hardware)
    { source: "user8", target: "user36", weight: 7 }, // Mason - Elijah (infrastructure + storage)
    { source: "user8", target: "user38", weight: 5 }, // Mason - Gabriel (infrastructure + developer tools)
    { source: "user8", target: "user46", weight: 6 }, // Mason - Max (infrastructure + compute)
    { source: "user32", target: "user36", weight: 5 }, // Zachary - Elijah (hardware + storage)
    { source: "user32", target: "user38", weight: 4 }, // Zachary - Gabriel (hardware + developer tools)
    { source: "user32", target: "user46", weight: 7 }, // Zachary - Max (hardware + compute)
    { source: "user36", target: "user38", weight: 5 }, // Elijah - Gabriel (storage + developer tools)
    { source: "user36", target: "user46", weight: 6 }, // Elijah - Max (storage + compute)
    { source: "user38", target: "user46", weight: 5 }, // Gabriel - Max (developer tools + compute)

    // DeFi/Trading interest connections
    { source: "user10", target: "user19", weight: 7 }, // Logan - Evelyn (defi + exchanges)
    { source: "user10", target: "user20", weight: 6 }, // Logan - Wyatt (defi + staking)
    { source: "user10", target: "user24", weight: 7 }, // Logan - Daniel (defi + stablecoins)
    { source: "user10", target: "user35", weight: 8 }, // Logan - Chloe (defi + lending)
    { source: "user10", target: "user42", weight: 6 }, // Logan - Julian (defi + derivatives)
    { source: "user10", target: "user50", weight: 7 }, // Logan - Theo (defi + liquid staking)
    { source: "user19", target: "user20", weight: 5 }, // Evelyn - Wyatt (exchanges + staking)
    { source: "user19", target: "user24", weight: 6 }, // Evelyn - Daniel (exchanges + stablecoins)
    { source: "user19", target: "user35", weight: 7 }, // Evelyn - Chloe (exchanges + lending)
    { source: "user19", target: "user42", weight: 8 }, // Evelyn - Julian (exchanges + derivatives)
    { source: "user19", target: "user50", weight: 5 }, // Evelyn - Theo (exchanges + liquid staking)
    { source: "user20", target: "user24", weight: 5 }, // Wyatt - Daniel (staking + stablecoins)
    { source: "user20", target: "user35", weight: 4 }, // Wyatt - Chloe (staking + lending)
    { source: "user20", target: "user42", weight: 5 }, // Wyatt - Julian (staking + derivatives)
    { source: "user20", target: "user50", weight: 9 }, // Wyatt - Theo (staking connection)
    { source: "user24", target: "user35", weight: 7 }, // Daniel - Chloe (stablecoins + lending)
    { source: "user24", target: "user42", weight: 6 }, // Daniel - Julian (stablecoins + derivatives)
    { source: "user24", target: "user50", weight: 5 }, // Daniel - Theo (stablecoins + liquid staking)
    { source: "user35", target: "user42", weight: 7 }, // Chloe - Julian (lending + derivatives)
    { source: "user35", target: "user50", weight: 6 }, // Chloe - Theo (lending + liquid staking)
    { source: "user42", target: "user50", weight: 7 }, // Julian - Theo (derivatives + liquid staking)

    // Identity/Reputation connections
    { source: "user14", target: "user15", weight: 6 }, // Aiden - Charlotte (identity + social)
    { source: "user14", target: "user48", weight: 9 }, // Aiden - Ezra (identity connection)
    { source: "user15", target: "user48", weight: 7 }, // Charlotte - Ezra (social + identity)

    // Random connections to increase total connection count and provide more pathways
    // These are lower weight connections between distant nodes
    { source: "user1", target: "user30", weight: 1 },
    { source: "user1", target: "user40", weight: 1 },
    { source: "user2", target: "user31", weight: 1 },
    { source: "user2", target: "user41", weight: 1 },
    { source: "user3", target: "user32", weight: 1 },
    { source: "user3", target: "user42", weight: 1 },
    { source: "user4", target: "user33", weight: 1 },
    { source: "user4", target: "user43", weight: 1 },
    { source: "user5", target: "user34", weight: 1 },
    { source: "user5", target: "user44", weight: 1 },
    { source: "user6", target: "user35", weight: 1 },
    { source: "user6", target: "user45", weight: 1 },
    { source: "user7", target: "user36", weight: 1 },
    { source: "user7", target: "user46", weight: 1 },
    { source: "user8", target: "user37", weight: 1 },
    { source: "user8", target: "user47", weight: 1 },
    { source: "user9", target: "user38", weight: 1 },
    { source: "user9", target: "user48", weight: 1 },
    { source: "user10", target: "user39", weight: 1 },
    { source: "user10", target: "user49", weight: 1 },
    { source: "user11", target: "user30", weight: 1 },
    { source: "user11", target: "user40", weight: 1 },
    { source: "user12", target: "user31", weight: 1 },
    { source: "user12", target: "user41", weight: 1 },
    { source: "user13", target: "user32", weight: 1 },
    { source: "user13", target: "user42", weight: 1 },
    { source: "user14", target: "user33", weight: 1 },
    { source: "user14", target: "user43", weight: 1 },
    { source: "user15", target: "user34", weight: 1 },
    { source: "user15", target: "user44", weight: 1 },
    { source: "user16", target: "user35", weight: 1 },
    { source: "user16", target: "user45", weight: 1 },
    { source: "user17", target: "user36", weight: 1 },
    { source: "user17", target: "user46", weight: 1 },
    { source: "user18", target: "user37", weight: 1 },
    { source: "user18", target: "user47", weight: 1 },
    { source: "user19", target: "user38", weight: 1 },
    { source: "user19", target: "user48", weight: 1 },
    { source: "user20", target: "user39", weight: 1 },
    { source: "user20", target: "user49", weight: 1 },

    // Generate all-to-all connections programmatically to reach 2000+ total connections
    ...(function generateConnections() {
      const connections = [];
      // Generate 1225 additional connections (50×49÷2 - existing connections)
      // Create a fully connected graph where every node connects to every other node
      for (let i = 1; i <= 50; i++) {
        for (let j = i + 1; j <= 50; j++) {
          // Skip connections we've already defined specifically above
          // We'll just add lower weight connections (weight 1-3) between all nodes
          // This will ensure we have at least 2000 connections in total
          if (Math.random() > 0.25) {
            // Skip some randomly to avoid overwhelming the visualization
            connections.push({
              source: `user${i}`,
              target: `user${j}`,
              weight: Math.floor(Math.random() * 3) + 1, // Random weight 1-3
            });
          }
        }
      }
      return connections;
    })(),
  ],
};
