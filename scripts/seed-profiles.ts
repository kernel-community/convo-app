import { PrismaClient } from "@prisma/client";
import { getDefaultProfilePicture } from "src/utils/constants";

const prisma = new PrismaClient();

interface SeedOptions {
  clear?: boolean;
  profileType?: "minimal" | "realistic" | "diverse" | "comprehensive";
  includeImages?: boolean;
  keywordDensity?: "sparse" | "medium" | "dense";
}

// Realistic bio templates with placeholders
const BIO_TEMPLATES = [
  // Tech/Web3 focused
  "Building the future of decentralized technology. Passionate about {interest1} and {interest2}. Currently exploring {interest3}.",
  "Full-stack developer with {years} years of experience. Love working with {interest1}, {interest2}, and diving deep into {interest3}.",
  "Product manager turned {role}. Fascinated by the intersection of {interest1} and {interest2}. Always learning about {interest3}.",
  "Crypto native since {year}. Building at the intersection of {interest1} and {interest2}. Excited about {interest3}.",

  // Community/Social focused
  "Community builder who loves connecting people around {interest1} and {interest2}. Currently focused on {interest3}.",
  "Researcher and writer exploring {interest1}, {interest2}, and {interest3}. Always happy to chat about emerging tech.",
  "Designer with a passion for {interest1} and {interest2}. Currently working on projects involving {interest3}.",
  "Entrepreneur building solutions in {interest1} and {interest2}. Particularly interested in {interest3}.",

  // Academic/Research focused
  "PhD in {field} turned {role}. Research interests include {interest1}, {interest2}, and {interest3}.",
  "Academic researcher studying the implications of {interest1} and {interest2} on society. Also exploring {interest3}.",
  "Former {previous_role} now working in {interest1} and {interest2}. Always curious about {interest3}.",

  // Creative/Art focused
  "Digital artist exploring {interest1} and {interest2}. Creating experiences that blend technology with {interest3}.",
  "Creative technologist working at the intersection of {interest1}, {interest2}, and {interest3}.",
  "Writer and content creator covering {interest1} and {interest2}. Currently deep-diving into {interest3}.",
];

// Keyword categories for realistic combinations
const KEYWORD_CATEGORIES = {
  blockchain: [
    "blockchain",
    "ethereum",
    "bitcoin",
    "defi",
    "web3",
    "smart-contracts",
    "cryptocurrency",
    "consensus",
    "proof-of-stake",
    "layer-2",
    "rollups",
  ],
  development: [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "python",
    "rust",
    "solidity",
    "full-stack",
    "frontend",
    "backend",
    "apis",
    "databases",
  ],
  ai_ml: [
    "artificial-intelligence",
    "machine-learning",
    "deep-learning",
    "nlp",
    "computer-vision",
    "neural-networks",
    "data-science",
    "pytorch",
    "tensorflow",
  ],
  design: [
    "ui-design",
    "ux-design",
    "product-design",
    "visual-design",
    "design-systems",
    "figma",
    "user-research",
    "prototyping",
    "branding",
  ],
  business: [
    "product-management",
    "growth",
    "marketing",
    "strategy",
    "operations",
    "venture-capital",
    "startups",
    "entrepreneurship",
    "business-development",
  ],
  research: [
    "research",
    "academia",
    "cryptography",
    "game-theory",
    "economics",
    "social-science",
    "philosophy",
    "ethics",
    "governance",
  ],
  community: [
    "community-building",
    "events",
    "networking",
    "education",
    "mentorship",
    "public-speaking",
    "writing",
    "content-creation",
    "social-impact",
  ],
  emerging: [
    "metaverse",
    "vr",
    "ar",
    "iot",
    "quantum-computing",
    "biotech",
    "climate-tech",
    "sustainability",
    "privacy",
    "security",
  ],
};

// Current affiliations by category
const AFFILIATIONS = {
  companies: [
    "Ethereum Foundation",
    "ConsenSys",
    "Chainlink",
    "Polygon",
    "Arbitrum",
    "Optimism",
    "Uniswap",
    "Compound",
    "Aave",
    "OpenSea",
    "MetaMask",
    "Google",
    "Microsoft",
    "Apple",
    "Meta",
    "Amazon",
    "Netflix",
    "Stripe",
    "Coinbase",
    "Binance",
    "FTX",
    "Kraken",
    "Circle",
    "Ripple",
  ],
  startups: [
    "Stealth Startup",
    "Early Stage Startup",
    "Blockchain Startup",
    "AI Startup",
    "Climate Tech Startup",
    "Fintech Startup",
    "EdTech Startup",
  ],
  academic: [
    "Stanford University",
    "MIT",
    "UC Berkeley",
    "Harvard University",
    "Oxford University",
    "Cambridge University",
    "ETH Zurich",
    "NYU",
  ],
  independent: [
    "Independent Researcher",
    "Freelance Developer",
    "Independent Consultant",
    "Solo Founder",
    "Digital Nomad",
    "Independent Creator",
    "Freelancer",
  ],
  funds: [
    "Andreessen Horowitz",
    "Paradigm",
    "Coinbase Ventures",
    "Pantera Capital",
    "Electric Capital",
    "Variant Fund",
    "1kx",
    "Placeholder VC",
  ],
};

// URLs for realistic profiles
const URL_TEMPLATES = [
  "https://twitter.com/{handle}",
  "https://github.com/{handle}",
  "https://linkedin.com/in/{handle}",
  "https://{handle}.com",
  "https://medium.com/@{handle}",
  "https://{handle}.substack.com",
];

// Helper functions
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateHandle(nickname: string): string {
  const base = nickname.toLowerCase().replace(/[^a-z0-9]/g, "");
  const variations = [
    base,
    `${base}${Math.floor(Math.random() * 100)}`,
    `${base}_dev`,
    `${base}_crypto`,
    `the${base}`,
    `${base}builds`,
  ];
  return getRandomItem(variations);
}

function generateKeywords(density: string, profileType: string): string[] {
  let keywordCount: number;

  switch (density) {
    case "sparse":
      keywordCount = Math.floor(Math.random() * 3) + 1; // 1-3 keywords
      break;
    case "medium":
      keywordCount = Math.floor(Math.random() * 5) + 3; // 3-7 keywords
      break;
    case "dense":
      keywordCount = Math.floor(Math.random() * 8) + 5; // 5-12 keywords
      break;
    default:
      keywordCount = Math.floor(Math.random() * 5) + 3;
  }

  // Select 2-3 categories based on profile type
  const allCategories = Object.keys(KEYWORD_CATEGORIES);
  let primaryCategories: string[];

  if (profileType === "diverse") {
    // Mix categories more broadly
    primaryCategories = getRandomItems(
      allCategories,
      Math.min(4, allCategories.length)
    );
  } else {
    // Focus on 2-3 related categories
    primaryCategories = getRandomItems(allCategories, 3);
  }

  const keywords: string[] = [];

  // Distribute keywords across selected categories
  primaryCategories.forEach((category, index) => {
    const categoryKeywords =
      KEYWORD_CATEGORIES[category as keyof typeof KEYWORD_CATEGORIES];
    const wordsFromCategory = Math.ceil(
      keywordCount / primaryCategories.length
    );
    const selectedWords = getRandomItems(
      categoryKeywords,
      Math.min(wordsFromCategory, categoryKeywords.length)
    );
    keywords.push(...selectedWords);
  });

  // Trim to desired count and remove duplicates
  const uniqueKeywords = [...new Set(keywords)];
  return uniqueKeywords.slice(0, keywordCount);
}

function generateBio(keywords: string[], nickname: string): string {
  const template = getRandomItem(BIO_TEMPLATES);

  // Create interest pool from keywords and related terms
  const interests = [...keywords];
  const shuffledInterests = interests.sort(() => 0.5 - Math.random());

  // Replace placeholders
  const bio = template
    .replace(/{interest1}/g, shuffledInterests[0] || "technology")
    .replace(/{interest2}/g, shuffledInterests[1] || "innovation")
    .replace(/{interest3}/g, shuffledInterests[2] || "web3")
    .replace(/{years}/g, `${Math.floor(Math.random() * 10) + 2}`)
    .replace(/{year}/g, `${2015 + Math.floor(Math.random() * 8)}`)
    .replace(
      /{role}/g,
      getRandomItem([
        "developer",
        "designer",
        "researcher",
        "founder",
        "consultant",
      ])
    )
    .replace(
      /{field}/g,
      getRandomItem([
        "Computer Science",
        "Mathematics",
        "Economics",
        "Philosophy",
      ])
    )
    .replace(
      /{previous_role}/g,
      getRandomItem(["consultant", "analyst", "researcher", "engineer"])
    );

  return bio;
}

function generateAffiliation(profileType: string): string {
  const allAffiliations = [
    ...AFFILIATIONS.companies,
    ...AFFILIATIONS.startups,
    ...AFFILIATIONS.academic,
    ...AFFILIATIONS.independent,
    ...AFFILIATIONS.funds,
  ];

  if (profileType === "comprehensive") {
    // Bias toward well-known companies/organizations
    const weightedAffiliations = [
      ...AFFILIATIONS.companies,
      ...AFFILIATIONS.companies, // Double weight
      ...AFFILIATIONS.academic,
      ...AFFILIATIONS.funds,
      ...AFFILIATIONS.startups,
    ];
    return getRandomItem(weightedAffiliations);
  }

  return getRandomItem(allAffiliations);
}

function generateUrl(nickname: string): string | undefined {
  // 70% chance of having a URL
  if (Math.random() > 0.3) {
    const template = getRandomItem(URL_TEMPLATES);
    const handle = generateHandle(nickname);
    return template.replace(/{handle}/g, handle);
  }
  return undefined;
}

async function seedProfiles(options: SeedOptions = {}) {
  const {
    clear = false,
    profileType = "realistic",
    includeImages = false,
    keywordDensity = "medium",
  } = options;

  console.log("🌱 Starting profile seeding...");
  console.log(`Options:`, {
    clear,
    profileType,
    includeImages,
    keywordDensity,
  });

  try {
    // Clear existing profiles if requested
    if (clear) {
      console.log("🧹 Clearing existing profiles...");
      const deletedCount = await prisma.profile.deleteMany({});
      console.log(`   Deleted ${deletedCount.count} existing profiles`);
    }

    // Get all users without profiles or users to update
    console.log("👥 Fetching users...");
    const users = await prisma.user.findMany({
      include: {
        profiles: true,
      },
    });

    if (users.length === 0) {
      console.log("❌ No users found to create profiles for");
      return;
    }

    const usersNeedingProfiles = clear
      ? users
      : users.filter((user) => !user.profiles);
    console.log(
      `   Found ${users.length} total users, ${usersNeedingProfiles.length} need profiles`
    );

    if (usersNeedingProfiles.length === 0) {
      console.log("✅ All users already have profiles!");
      return;
    }

    // Generate profiles
    console.log("🎨 Generating profile data...");
    const profiles = [];

    for (const user of usersNeedingProfiles) {
      const keywords = generateKeywords(keywordDensity, profileType);
      const bio = generateBio(keywords, user.nickname);
      const currentAffiliation = generateAffiliation(profileType);
      const url = generateUrl(user.nickname);

      profiles.push({
        userId: user.id,
        bio,
        keywords,
        currentAffiliation,
        url,
      });
    }

    // Insert profiles
    console.log("💾 Creating profiles...");
    let created = 0;

    for (const profileData of profiles) {
      try {
        await prisma.profile.upsert({
          where: {
            userId_communityId: {
              userId: profileData.userId,
              communityId: null as any,
            },
          },
          update: profileData,
          create: profileData,
        });
        created++;

        if (created % 10 === 0) {
          console.log(`   Progress: ${created}/${profiles.length} profiles`);
        }
      } catch (error) {
        console.error(
          `   Failed to create profile for user ${profileData.userId}:`,
          error
        );
      }
    }

    console.log("✅ Profile seeding completed!");
    console.log(`📊 Summary:
    - Users processed: ${usersNeedingProfiles.length}
    - Profiles created: ${created}
    - Profile type: ${profileType}
    - Keyword density: ${keywordDensity}
    - Images included: ${includeImages}`);

    // Show some sample profiles
    const sampleProfiles = await prisma.profile.findMany({
      take: 5,
      include: {
        user: { select: { nickname: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("\n👤 Sample profiles:");
    sampleProfiles.forEach((profile) => {
      console.log(`   ${profile.user.nickname}:`);
      console.log(`     Bio: ${profile.bio?.substring(0, 80)}...`);
      console.log(
        `     Keywords: ${profile.keywords.slice(0, 5).join(", ")}${
          profile.keywords.length > 5 ? "..." : ""
        }`
      );
      console.log(`     Affiliation: ${profile.currentAffiliation}`);
      console.log(`     URL: ${profile.url || "None"}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error seeding profiles:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: SeedOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--clear":
        options.clear = true;
        break;
      case "--type":
        options.profileType = args[++i] as any;
        break;
      case "--keywords":
        options.keywordDensity = args[++i] as any;
        break;
      case "--no-images":
        options.includeImages = false;
        break;
      case "--help":
        console.log(`
Profile Seeding Script

Usage: npx tsx scripts/seed-profiles.ts [options]

Options:
  --clear                 Clear existing profiles before seeding
  --type <type>           Profile type: minimal, realistic, diverse, comprehensive (default: realistic)
  --keywords <density>    Keyword density: sparse, medium, dense (default: medium)
  --no-images            Don't generate profile images
  --help                 Show this help message

Profile Types:
  minimal       - Basic profiles with few keywords and simple bios
  realistic     - Balanced profiles similar to real users
  diverse       - Varied profiles across different domains
  comprehensive - Rich profiles with well-known affiliations

Examples:
  npx tsx scripts/seed-profiles.ts --clear --type diverse
  npx tsx scripts/seed-profiles.ts --keywords dense --no-images
  npx tsx scripts/seed-profiles.ts --clear --type comprehensive
        `);
        return;
    }
  }

  await seedProfiles(options);
}

if (require.main === module) {
  main().catch(console.error);
}

export { seedProfiles };
