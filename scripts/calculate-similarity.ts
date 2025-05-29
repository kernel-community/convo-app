#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import { SimilarityService } from "../src/lib/similarity/similarity-service";
import type { SimilarityWeights } from "../src/lib/similarity/types";

const prisma = new PrismaClient();

interface ScriptOptions {
  clear?: boolean;
  userId?: string;
  verbose?: boolean;
  dryRun?: boolean;
  weights?: SimilarityWeights;
  minScore?: number;
}

async function calculateSimilarities(options: ScriptOptions = {}) {
  const {
    clear = false,
    userId,
    verbose = false,
    dryRun = false,
    weights,
    minScore = 1,
  } = options;

  console.log("🧮 Starting user similarity calculation...");
  console.log(`Options:`, {
    clear,
    userId: userId || "all users",
    verbose,
    dryRun,
    minScore,
    customWeights: !!weights,
  });

  try {
    // Clear existing connections if requested
    if (clear && !dryRun) {
      console.log("🧹 Clearing existing algorithm-calculated connections...");
      const deletedCount = await prisma.connections.deleteMany({
        // where: {
        //   description: {
        //     contains: "algorithm-calculated",
        //   },
        // },
      });
      console.log(
        `   Deleted ${deletedCount.count} existing algorithm connections`
      );
    }

    // Initialize similarity service
    const similarityService = new SimilarityService(weights);

    if (userId) {
      // Calculate similarities for a specific user
      console.log(`🎯 Calculating similarities for user: ${userId}`);

      if (dryRun) {
        const similarities = await similarityService.calculateSimilarityForUser(
          userId
        );
        console.log(
          `📊 Would update ${similarities.length} connections for user ${userId}`
        );

        if (verbose) {
          console.log("\n🔍 Top 10 similarities:");
          similarities.slice(0, 10).forEach((sim, index) => {
            console.log(
              `   ${index + 1}. User ${sim.userId2}: Score ${sim.overallScore}`
            );
            if (verbose) {
              console.log(
                `      - Keywords: ${sim.factors.keywordSimilarity.toFixed(3)}`
              );
              console.log(
                `      - Bio: ${sim.factors.bioSimilarity.toFixed(3)}`
              );
              console.log(
                `      - Affiliation: ${sim.factors.affiliationMatch.toFixed(
                  3
                )}`
              );
            }
          });
        }
      } else {
        const result = await similarityService.recalculateSimilaritiesForUser(
          userId
        );
        console.log(
          `✅ Updated ${result.updatedConnections} connections for user ${userId}`
        );

        if (result.errors.length > 0) {
          console.log(`⚠️  Errors: ${result.errors.length}`);
          result.errors.forEach((error) => console.log(`   - ${error}`));
        }
      }
    } else {
      // Calculate similarities for all users
      console.log("🌐 Calculating similarities for all users...");

      if (dryRun) {
        // Get user count for estimation
        const userCount = await prisma.user.count();
        const estimatedPairs = (userCount * (userCount - 1)) / 2;
        console.log(
          `📊 Would process approximately ${estimatedPairs} user pairs`
        );
        console.log("   Run without --dry-run to execute calculations");
      } else {
        const result =
          await similarityService.calculateAndUpdateAllSimilarities();

        console.log(`✅ Similarity calculation completed!`);
        console.log(`📊 Results:
          - Processed pairs: ${result.processedPairs}
          - Updated connections: ${result.updatedConnections}
          - New connections: ${result.newConnections}
          - Errors: ${result.errors.length}`);

        if (result.errors.length > 0) {
          console.log("\n⚠️  Errors encountered:");
          result.errors.forEach((error) => console.log(`   - ${error}`));
        }
      }
    }

    // Show network statistics
    if (!dryRun) {
      console.log("\n📈 Network Statistics:");
      const stats = await similarityService.getNetworkSimilarityStats();
      console.log(`   Total connections: ${stats.totalConnections}`);
      console.log(`   Average weight: ${stats.averageWeight.toFixed(2)}`);
      console.log(
        `   High similarity pairs (≥7): ${stats.highSimilarityPairs}`
      );
      console.log(
        `   Last calculated: ${stats.lastCalculated?.toISOString() || "Never"}`
      );

      if (verbose) {
        console.log("\n📊 Weight Distribution:");
        Object.entries(stats.weightDistribution)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .forEach(([weight, count]) => {
            const percentage = ((count / stats.totalConnections) * 100).toFixed(
              1
            );
            console.log(
              `   Weight ${weight}: ${count} connections (${percentage}%)`
            );
          });
      }
    }
  } catch (error) {
    console.error("❌ Error during similarity calculation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--clear":
        options.clear = true;
        break;
      case "--user":
        options.userId = args[++i];
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--min-score":
        options.minScore = parseInt(args[++i] || "1") || 1;
        break;
      case "--help":
        console.log(`
Usage: npx tsx scripts/calculate-similarity.ts [options]

Options:
  --clear              Clear existing algorithm-calculated connections before running
  --user <userId>      Calculate similarities only for specified user
  --verbose           Show detailed output and statistics
  --dry-run           Show what would be done without making changes
  --min-score <num>   Minimum similarity score to create connection (1-10)
  --help              Show this help message

Examples:
  # Calculate similarities for all users
  npx tsx scripts/calculate-similarity.ts

  # Calculate similarities for a specific user
  npx tsx scripts/calculate-similarity.ts --user "user-id-here"

  # Dry run to see what would happen
  npx tsx scripts/calculate-similarity.ts --dry-run --verbose

  # Clear existing and recalculate with verbose output
  npx tsx scripts/calculate-similarity.ts --clear --verbose
        `);
        process.exit(0);
      default:
        if (arg && arg.startsWith("--")) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();

  calculateSimilarities(options)
    .then(() => {
      console.log("🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}
