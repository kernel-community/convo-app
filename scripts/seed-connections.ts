import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedOptions {
  clear?: boolean;
  connectionDensity?: "sparse" | "medium" | "dense" | "full";
  maxConnections?: number;
  weightDistribution?: "random" | "realistic" | "clustered";
  includeWeakConnections?: boolean;
}

// Predefined connection descriptions for more realistic data
const CONNECTION_DESCRIPTIONS = [
  // High weight (8-10) - Strong connections
  "Collaborated on multiple projects together",
  "Close friends who share many interests",
  "Worked at the same company for years",
  "Both passionate about similar causes",
  "Met through mutual friends, instant connection",
  "Share similar career trajectories",
  "Both involved in the same community",
  "Long-time study partners",

  // Medium weight (4-7) - Moderate connections
  "Met at a conference, stayed in touch",
  "Have overlapping professional networks",
  "Share some common interests",
  "Connected through work projects",
  "Both attend similar events",
  "Have mutual acquaintances",
  "Similar educational backgrounds",
  "Both interested in technology",

  // Low weight (1-3) - Weak connections
  "Brief interaction at an event",
  "Connected on social media",
  "Distant acquaintances",
  "Met once through mutual friends",
  "Both part of the same large community",
  "Occasional interaction online",
  "Similar location, different circles",
  "Weak professional connection",
];

// Utility function to ensure weight stays within bounds
function clampWeight(weight: number): number {
  return Math.max(1, Math.min(10, weight));
}

// Generate realistic weight distributions
function generateWeight(
  distribution: string,
  userPairIndex: number,
  totalPairs: number
): number {
  switch (distribution) {
    case "random":
      return Math.floor(Math.random() * 10) + 1;

    case "realistic":
      // Most connections are weak (1-3), some medium (4-7), few strong (8-10)
      const rand = Math.random();
      if (rand < 0.6) return Math.floor(Math.random() * 3) + 1; // 60% weak (1-3)
      if (rand < 0.85) return Math.floor(Math.random() * 4) + 4; // 25% medium (4-7)
      return Math.floor(Math.random() * 3) + 8; // 15% strong (8-10)

    case "clustered":
      // Create clusters of highly connected users
      const clusterSize = Math.ceil(Math.sqrt(totalPairs));
      const cluster = Math.floor(userPairIndex / clusterSize);
      const withinCluster = userPairIndex % clusterSize < clusterSize / 2;

      if (withinCluster) {
        return Math.floor(Math.random() * 4) + 7; // Strong within cluster (7-10)
      } else {
        return Math.floor(Math.random() * 3) + 1; // Weak between clusters (1-3)
      }

    default:
      return Math.floor(Math.random() * 10) + 1;
  }
}

// Get appropriate description based on weight
function getDescription(weight: number): string {
  if (weight >= 8) {
    // High weight descriptions
    const highWeightDescs = CONNECTION_DESCRIPTIONS.slice(0, 8);
    return (
      highWeightDescs[Math.floor(Math.random() * highWeightDescs.length)] ||
      "Strong connection"
    );
  } else if (weight >= 4) {
    // Medium weight descriptions
    const mediumWeightDescs = CONNECTION_DESCRIPTIONS.slice(8, 16);
    return (
      mediumWeightDescs[Math.floor(Math.random() * mediumWeightDescs.length)] ||
      "Moderate connection"
    );
  } else {
    // Low weight descriptions
    const lowWeightDescs = CONNECTION_DESCRIPTIONS.slice(16);
    return (
      lowWeightDescs[Math.floor(Math.random() * lowWeightDescs.length)] ||
      "Weak connection"
    );
  }
}

// Calculate how many connections to create based on density
function calculateConnectionCount(
  userCount: number,
  density: string,
  maxConnections?: number
): number {
  const maxPossible = (userCount * (userCount - 1)) / 2; // Total possible unique pairs

  let targetCount: number;

  switch (density) {
    case "sparse":
      targetCount = Math.floor(maxPossible * 0.1); // 10% of possible connections
      break;
    case "medium":
      targetCount = Math.floor(maxPossible * 0.3); // 30% of possible connections
      break;
    case "dense":
      targetCount = Math.floor(maxPossible * 0.6); // 60% of possible connections
      break;
    case "full":
      targetCount = maxPossible; // All possible connections
      break;
    default:
      targetCount = Math.floor(maxPossible * 0.3);
  }

  // Apply max connections limit if specified
  if (maxConnections && targetCount > maxConnections) {
    targetCount = maxConnections;
  }

  return Math.min(targetCount, maxPossible);
}

// Generate pairs of users for connections
function generateUserPairs(
  users: { id: string }[],
  connectionCount: number
): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  const usedPairs = new Set<string>();

  // First, create some connections for each user to ensure no isolated nodes
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (!user) continue;

    // Connect each user to at least 1-3 others
    const minConnections = Math.min(
      3,
      Math.floor(connectionCount / users.length)
    );

    for (let j = 0; j < minConnections; j++) {
      let otherUser;
      let attempts = 0;

      do {
        const randomIndex = Math.floor(Math.random() * users.length);
        otherUser = users[randomIndex];
        attempts++;
      } while (
        (!otherUser ||
          otherUser.id === user.id ||
          usedPairs.has(
            `${user.id < otherUser.id ? user.id : otherUser.id}-${
              user.id < otherUser.id ? otherUser.id : user.id
            }`
          )) &&
        attempts < 10
      );

      if (otherUser && otherUser.id !== user.id && attempts < 10) {
        const pairKey = `${user.id < otherUser.id ? user.id : otherUser.id}-${
          user.id < otherUser.id ? otherUser.id : user.id
        }`;
        usedPairs.add(pairKey);
        pairs.push([user.id, otherUser.id]);
      }
    }
  }

  // Fill remaining connections randomly
  let attempts = 0;
  const maxAttempts = connectionCount * 10; // Prevent infinite loops

  while (pairs.length < connectionCount && attempts < maxAttempts) {
    attempts++;

    const user1Index = Math.floor(Math.random() * users.length);
    const user2Index = Math.floor(Math.random() * users.length);
    const user1 = users[user1Index];
    const user2 = users[user2Index];

    if (!user1 || !user2 || user1.id === user2.id) {
      continue;
    }

    const pairKey = `${user1.id < user2.id ? user1.id : user2.id}-${
      user1.id < user2.id ? user2.id : user1.id
    }`;

    if (!usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      pairs.push([user1.id, user2.id]);
    }
  }

  return pairs;
}

async function seedConnections(options: SeedOptions = {}) {
  const {
    clear = false,
    connectionDensity = "medium",
    maxConnections,
    weightDistribution = "realistic",
    includeWeakConnections = true,
  } = options;

  console.log("🌱 Starting connection seeding...");
  console.log(`Options:`, {
    clear,
    connectionDensity,
    maxConnections,
    weightDistribution,
    includeWeakConnections,
  });

  try {
    // Clear existing connections if requested
    if (clear) {
      console.log("🧹 Clearing existing connections...");
      const deletedCount = await prisma.connections.deleteMany({});
      console.log(`   Deleted ${deletedCount.count} existing connections`);
    }

    // Get all users
    console.log("👥 Fetching users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        email: true,
      },
    });

    if (users.length < 2) {
      console.log("❌ Need at least 2 users to create connections");
      return;
    }

    console.log(`   Found ${users.length} users`);

    // Calculate number of connections to create
    const connectionCount = calculateConnectionCount(
      users.length,
      connectionDensity,
      maxConnections
    );
    console.log(
      `🔗 Planning to create ${connectionCount} connections (${connectionDensity} density)`
    );

    // Generate user pairs
    console.log("🎲 Generating user pairs...");
    const userPairs = generateUserPairs(users, connectionCount);

    // Create connections
    console.log("💾 Creating connections...");
    const connections = [];

    for (let i = 0; i < userPairs.length; i++) {
      const pair = userPairs[i];
      if (!pair) continue;

      const [fromId, toId] = pair;
      const weight = generateWeight(weightDistribution, i, userPairs.length);

      // Skip weak connections if not included
      if (!includeWeakConnections && weight <= 2) {
        continue;
      }

      const description = getDescription(weight);

      connections.push({
        fromId,
        toId,
        weight,
        description,
      });

      // Create bidirectional connection (from B to A as well)
      connections.push({
        fromId: toId,
        toId: fromId,
        weight: clampWeight(weight + Math.floor(Math.random() * 3) - 1), // Slight weight variation, clamped to 1-10
        description,
      });
    }

    // Insert connections in batches for better performance
    console.log(
      `   Inserting ${connections.length} total connections (bidirectional)...`
    );
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, i + batchSize);
      await prisma.connections.createMany({
        data: batch,
        skipDuplicates: true, // Skip if connection already exists
      });
      inserted += batch.length;

      if (i % (batchSize * 5) === 0) {
        console.log(
          `   Progress: ${inserted}/${connections.length} connections`
        );
      }
    }

    console.log("✅ Connection seeding completed!");
    console.log(`📊 Summary:
    - Users: ${users.length}
    - Connections created: ${inserted}
    - Average connections per user: ${(inserted / users.length).toFixed(1)}
    - Weight distribution: ${weightDistribution}
    - Density: ${connectionDensity}`);

    // Show some sample connections
    const sampleConnections = await prisma.connections.findMany({
      take: 5,
      include: {
        from: { select: { nickname: true } },
        to: { select: { nickname: true } },
      },
      orderBy: { weight: "desc" },
    });

    console.log("\n🔗 Sample connections:");
    sampleConnections.forEach((conn) => {
      console.log(
        `   ${conn.from.nickname} ↔ ${conn.to.nickname} (weight: ${conn.weight}) - ${conn.description}`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding connections:", error);
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
      case "--density":
        options.connectionDensity = args[++i] as any;
        break;
      case "--max":
        const maxArg = args[++i];
        if (maxArg) {
          options.maxConnections = parseInt(maxArg);
        }
        break;
      case "--distribution":
        options.weightDistribution = args[++i] as any;
        break;
      case "--no-weak":
        options.includeWeakConnections = false;
        break;
      case "--help":
        console.log(`
Connection Seeding Script

Usage: npx tsx scripts/seed-connections.ts [options]

Options:
  --clear                 Clear existing connections before seeding
  --density <type>        Connection density: sparse, medium, dense, full (default: medium)
  --max <number>          Maximum number of connections to create
  --distribution <type>   Weight distribution: random, realistic, clustered (default: realistic)
  --no-weak              Exclude weak connections (weight <= 2)
  --help                 Show this help message

Examples:
  npx tsx scripts/seed-connections.ts --clear --density sparse
  npx tsx scripts/seed-connections.ts --density dense --max 1000
  npx tsx scripts/seed-connections.ts --clear --distribution clustered
        `);
        return;
    }
  }

  await seedConnections(options);
}

if (require.main === module) {
  main().catch(console.error);
}

export { seedConnections };
