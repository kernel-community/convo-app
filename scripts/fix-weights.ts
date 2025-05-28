import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAndFixWeights() {
  console.log("🔍 Checking weight distribution in Connections table...\n");

  try {
    // Get all weights and their counts
    const weightCounts = await prisma.connections.groupBy({
      by: ["weight"],
      _count: {
        weight: true,
      },
      orderBy: {
        weight: "asc",
      },
    });

    console.log("📊 Current weight distribution:");
    weightCounts.forEach(({ weight, _count }) => {
      const status = weight < 1 || weight > 10 ? " ❌ OUT OF RANGE" : "";
      console.log(`   Weight ${weight}: ${_count.weight} connections${status}`);
    });

    // Find connections with invalid weights
    const invalidConnections = await prisma.connections.findMany({
      where: {
        OR: [{ weight: { lt: 1 } }, { weight: { gt: 10 } }],
      },
      select: {
        id: true,
        weight: true,
        description: true,
      },
    });

    if (invalidConnections.length === 0) {
      console.log("\n✅ All weights are within valid range (1-10)");
      return;
    }

    console.log(
      `\n⚠️  Found ${invalidConnections.length} connections with invalid weights:`
    );
    invalidConnections.slice(0, 5).forEach((conn) => {
      console.log(
        `   ID: ${conn.id.slice(0, 8)}... Weight: ${
          conn.weight
        } - ${conn.description.slice(0, 30)}...`
      );
    });

    if (invalidConnections.length > 5) {
      console.log(`   ... and ${invalidConnections.length - 5} more`);
    }

    // Ask user if they want to fix
    console.log("\n🔧 Fixing invalid weights...");

    // Fix weights by clamping to valid range
    const updates = invalidConnections.map((conn) => ({
      where: { id: conn.id },
      data: {
        weight: Math.max(1, Math.min(10, conn.weight)),
      },
    }));

    // Batch update using transaction
    const results = await prisma.$transaction(
      updates.map((update) => prisma.connections.update(update))
    );

    console.log(`✅ Fixed ${results.length} connections`);

    // Show final distribution
    console.log("\n📊 Updated weight distribution:");
    const updatedCounts = await prisma.connections.groupBy({
      by: ["weight"],
      _count: {
        weight: true,
      },
      orderBy: {
        weight: "asc",
      },
    });

    updatedCounts.forEach(({ weight, _count }) => {
      console.log(`   Weight ${weight}: ${_count.weight} connections`);
    });
  } catch (error) {
    console.error("❌ Error checking/fixing weights:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Weight Fix Script

Usage: npx tsx scripts/fix-weights.ts

This script:
1. Checks the current weight distribution in the Connections table
2. Identifies any weights outside the valid range (1-10)
3. Fixes invalid weights by clamping them to the valid range
4. Shows before/after distribution

Options:
  --help    Show this help message
    `);
    return;
  }

  await checkAndFixWeights();
}

if (require.main === module) {
  main().catch(console.error);
}

export { checkAndFixWeights };
