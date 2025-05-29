import { prisma } from "src/utils/db";
import { SimilarityCalculator } from "./calculator";
import { SimilarityDataProcessor } from "./data-processor";
import type { UserSimilarityScore, SimilarityWeights } from "./types";

export class SimilarityService {
  private calculator: SimilarityCalculator;
  private dataProcessor: SimilarityDataProcessor;

  constructor(weights?: SimilarityWeights) {
    this.calculator = new SimilarityCalculator(weights);
    this.dataProcessor = new SimilarityDataProcessor();
  }

  /**
   * Calculate and update all user similarity scores
   */
  async calculateAndUpdateAllSimilarities(): Promise<{
    processedPairs: number;
    updatedConnections: number;
    newConnections: number;
    errors: string[];
  }> {
    console.log("🧮 Starting similarity calculation for all users...");

    const errors: string[] = [];
    let updatedConnections = 0;
    let newConnections = 0;

    try {
      // Extract user profile data
      console.log("📊 Extracting user profile data...");
      const userProfiles = await this.dataProcessor.extractUserProfileData();
      console.log(`   Found ${userProfiles.length} users to analyze`);

      if (userProfiles.length < 2) {
        console.log("⚠️  Need at least 2 users for similarity calculations");
        return {
          processedPairs: 0,
          updatedConnections: 0,
          newConnections: 0,
          errors: ["Not enough users for similarity calculation"],
        };
      }

      // Calculate all similarities
      console.log("🔄 Calculating similarities...");
      const similarities =
        this.calculator.calculateAllSimilarities(userProfiles);
      console.log(`   Calculated ${similarities.length} similarity pairs`);

      // Update connections in batches
      console.log("💾 Updating database connections...");
      const batchSize = 50;

      for (let i = 0; i < similarities.length; i += batchSize) {
        const batch = similarities.slice(i, i + batchSize);

        for (const similarity of batch) {
          try {
            const result = await this.updateConnectionWithSimilarity(
              similarity
            );
            if (result.wasNew) {
              newConnections++;
            } else {
              updatedConnections++;
            }
          } catch (error) {
            console.error(
              `Error updating connection ${similarity.userId1} -> ${similarity.userId2}:`,
              error
            );
            errors.push(
              `Failed to update connection ${similarity.userId1} -> ${similarity.userId2}: ${error}`
            );
          }
        }

        // Progress update
        if (i % (batchSize * 5) === 0) {
          console.log(
            `   Progress: ${Math.min(i + batchSize, similarities.length)}/${
              similarities.length
            } pairs processed`
          );
        }
      }

      console.log("✅ Similarity calculation completed!");
      console.log(`📊 Summary:
        - Processed pairs: ${similarities.length}
        - Updated connections: ${updatedConnections}
        - New connections: ${newConnections}
        - Errors: ${errors.length}`);

      return {
        processedPairs: similarities.length,
        updatedConnections,
        newConnections,
        errors,
      };
    } catch (error) {
      console.error("❌ Error in similarity calculation:", error);
      errors.push(`Global error: ${error}`);

      return {
        processedPairs: 0,
        updatedConnections,
        newConnections,
        errors,
      };
    }
  }

  /**
   * Update a single connection with similarity score
   */
  private async updateConnectionWithSimilarity(
    similarity: UserSimilarityScore
  ): Promise<{ wasNew: boolean }> {
    const { userId1, userId2, overallScore, factors } = similarity;

    // Generate description based on similarity factors
    const description = await this.generateConnectionDescription(similarity);

    try {
      // Try to update existing connection first
      const existingConnection = await prisma.connections.findFirst({
        where: {
          OR: [
            { fromId: userId1, toId: userId2 },
            { fromId: userId2, toId: userId1 },
          ],
        },
      });

      if (existingConnection) {
        // Update existing connection
        await prisma.connections.update({
          where: { id: existingConnection.id },
          data: {
            weight: Math.max(1, Math.min(10, overallScore)), // Ensure weight is 1-10
            description,
          },
        });

        // Also create/update the reverse connection for bidirectionality
        const reverseConnection = await prisma.connections.findFirst({
          where: {
            fromId: existingConnection.toId,
            toId: existingConnection.fromId,
          },
        });

        if (!reverseConnection) {
          await prisma.connections.create({
            data: {
              fromId: existingConnection.toId,
              toId: existingConnection.fromId,
              weight: Math.max(1, Math.min(10, overallScore)),
              description,
            },
          });
        } else {
          await prisma.connections.update({
            where: { id: reverseConnection.id },
            data: {
              weight: Math.max(1, Math.min(10, overallScore)),
              description,
            },
          });
        }

        return { wasNew: false };
      } else {
        // Create new bidirectional connections
        await prisma.connections.createMany({
          data: [
            {
              fromId: userId1,
              toId: userId2,
              weight: Math.max(1, Math.min(10, overallScore)),
              description,
            },
            {
              fromId: userId2,
              toId: userId1,
              weight: Math.max(1, Math.min(10, overallScore)),
              description,
            },
          ],
          skipDuplicates: true,
        });

        return { wasNew: true };
      }
    } catch (error) {
      // Handle unique constraint violations gracefully
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        console.log(
          `   Skipping duplicate connection ${userId1} <-> ${userId2}`
        );
        return { wasNew: false };
      }
      throw error;
    }
  }

  /**
   * Generate detailed description showing exactly how similarity was calculated
   */
  private async generateConnectionDescription(
    similarity: UserSimilarityScore
  ): Promise<string> {
    const { factors, overallScore, userId1, userId2 } = similarity;

    // Get the raw user data to show specific matches
    const userProfiles = await this.dataProcessor.extractUserProfileData();
    const user1Profile = userProfiles.find((profile) => profile.id === userId1);
    const user2Profile = userProfiles.find((profile) => profile.id === userId2);

    if (!user1Profile || !user2Profile) {
      // Fallback to basic description if user data not found
      return this.generateBasicConnectionDescription(similarity);
    }

    // Get the weights used for calculation
    const weights = this.calculator.getWeights();

    // Get detailed matching information for each factor
    const keywordDetails = this.calculator.getKeywordMatchDetails(
      user1Profile.keywords,
      user2Profile.keywords
    );
    const bioDetails = this.calculator.getBioMatchDetails(
      user1Profile.bio,
      user2Profile.bio
    );
    const affiliationDetails = this.calculator.getAffiliationMatchDetails(
      user1Profile.affiliation,
      user2Profile.affiliation
    );

    // Calculate individual contributions
    const keywordContribution = factors.keywordSimilarity * weights.keywords;
    const bioContribution = factors.bioSimilarity * weights.bio;
    const affiliationContribution =
      factors.affiliationMatch * weights.affiliation;

    // Calculate the raw weighted sum (before scaling to 1-10)
    const rawWeightedSum =
      keywordContribution + bioContribution + affiliationContribution;

    // Build detailed description
    const details: string[] = [];

    // Overall similarity level
    if (overallScore >= 8) {
      details.push("VERY STRONG SIMILARITY");
    } else if (overallScore >= 6) {
      details.push("STRONG SIMILARITY");
    } else if (overallScore >= 4) {
      details.push("MODERATE SIMILARITY");
    } else {
      details.push("WEAK SIMILARITY");
    }

    // Detailed calculation breakdown with specific matches
    details.push("CALCULATION BREAKDOWN:");

    // Keywords section with specific matches
    const keywordSection = [];
    keywordSection.push(
      `Keywords: ${(factors.keywordSimilarity * 100).toFixed(1)}% match × ${(
        weights.keywords * 100
      ).toFixed(0)}% weight = ${(keywordContribution * 100).toFixed(1)} points`
    );

    if (keywordDetails.matches.length > 0) {
      keywordSection.push(
        `↳ Matched keywords: '${keywordDetails.matches.join("', '")}' (${
          keywordDetails.matches.length
        } shared)`
      );
      if (keywordDetails.unique1.length > 0) {
        keywordSection.push(
          `↳ User1 only: '${keywordDetails.unique1.slice(0, 3).join("', '")}'${
            keywordDetails.unique1.length > 3
              ? ` +${keywordDetails.unique1.length - 3} more`
              : ""
          }`
        );
      }
      if (keywordDetails.unique2.length > 0) {
        keywordSection.push(
          // eslint-disable-next-line quotes
          `↳ User2 only: '${keywordDetails.unique2.slice(0, 3).join("', '")}'${
            keywordDetails.unique2.length > 3
              ? ` +${keywordDetails.unique2.length - 3} more`
              : ""
          }`
        );
      }
    } else {
      keywordSection.push("↳ No matching keywords found");
    }

    // Bio text section with specific matches
    const bioSection = [];
    bioSection.push(
      `Bio Text: ${(factors.bioSimilarity * 100).toFixed(1)}% match × ${(
        weights.bio * 100
      ).toFixed(0)}% weight = ${(bioContribution * 100).toFixed(1)} points`
    );

    if (bioDetails.matches.length > 0) {
      bioSection.push(
        `↳ Matched terms: '${bioDetails.matches.slice(0, 5).join("', '")}'${
          bioDetails.matches.length > 5
            ? ` +${bioDetails.matches.length - 5} more`
            : ""
        } (${bioDetails.matches.length} shared)`
      );
    } else {
      bioSection.push("↳ No matching bio terms found");
    }

    // Affiliation section with specific matches
    const affiliationSection = [];
    affiliationSection.push(
      `Affiliation: ${(factors.affiliationMatch * 100).toFixed(1)}% match × ${(
        weights.affiliation * 100
      ).toFixed(0)}% weight = ${(affiliationContribution * 100).toFixed(
        1
      )} points`
    );

    switch (affiliationDetails.matchType) {
      case "exact":
        affiliationSection.push(
          `↳ Exact match: "${affiliationDetails.matchedParts[0]}"`
        );
        break;
      case "partial":
        affiliationSection.push(
          `↳ Partial match: "${affiliationDetails.matchedParts[0]}" contained in both affiliations`
        );
        break;
      case "keyword":
        affiliationSection.push(
          `↳ Keyword matches: '${affiliationDetails.matchedParts.join(
            "', '"
          )}" (${affiliationDetails.matchedParts.length} shared terms)`
        );
        break;
      case "none":
        affiliationSection.push(`↳ No affiliation match found`);
        break;
    }

    // Add all sections
    details.push(`• ${keywordSection.join(" ")}`);
    details.push(`• ${bioSection.join(" ")}`);
    details.push(`• ${affiliationSection.join(" ")}`);

    // Raw calculation summary
    details.push(`• Raw Sum: ${(rawWeightedSum * 100).toFixed(1)} points`);
    details.push(
      `• Final Score: ${(rawWeightedSum * 100).toFixed(
        1
      )}/100 → ${overallScore}/10`
    );

    // Factor analysis with detailed breakdown
    const factorAnalysis: string[] = [];

    if (factors.keywordSimilarity > 0.7) {
      factorAnalysis.push(
        `HIGH keyword overlap (${(factors.keywordSimilarity * 100).toFixed(
          1
        )}% - ${keywordDetails.matches.length} matches)`
      );
    } else if (factors.keywordSimilarity > 0.3) {
      factorAnalysis.push(
        `MODERATE keyword overlap (${(factors.keywordSimilarity * 100).toFixed(
          1
        )}% - ${keywordDetails.matches.length} matches)`
      );
    } else if (factors.keywordSimilarity > 0) {
      factorAnalysis.push(
        `LOW keyword overlap (${(factors.keywordSimilarity * 100).toFixed(
          1
        )}% - ${keywordDetails.matches.length} matches)`
      );
    } else {
      factorAnalysis.push(`NO keyword overlap (0% - 0 matches)`);
    }

    if (factors.bioSimilarity > 0.7) {
      factorAnalysis.push(
        `HIGH bio text similarity (${(factors.bioSimilarity * 100).toFixed(
          1
        )}% - ${bioDetails.matches.length} terms)`
      );
    } else if (factors.bioSimilarity > 0.3) {
      factorAnalysis.push(
        `MODERATE bio text similarity (${(factors.bioSimilarity * 100).toFixed(
          1
        )}% - ${bioDetails.matches.length} terms)`
      );
    } else if (factors.bioSimilarity > 0) {
      factorAnalysis.push(
        `LOW bio text similarity (${(factors.bioSimilarity * 100).toFixed(
          1
        )}% - ${bioDetails.matches.length} terms)`
      );
    } else {
      factorAnalysis.push(`NO bio text similarity (0% - 0 terms)`);
    }

    if (factors.affiliationMatch > 0.7) {
      factorAnalysis.push(
        `HIGH affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}% - ${affiliationDetails.matchType})`
      );
    } else if (factors.affiliationMatch > 0.3) {
      factorAnalysis.push(
        `MODERATE affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}% - ${affiliationDetails.matchType})`
      );
    } else if (factors.affiliationMatch > 0) {
      factorAnalysis.push(
        `LOW affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}% - ${affiliationDetails.matchType})`
      );
    } else {
      factorAnalysis.push(`NO affiliation match (0% - none)`);
    }

    if (factorAnalysis.length > 0) {
      details.push(`FACTOR ANALYSIS: ${factorAnalysis.join(", ")}`);
    }

    // Dominant factors
    const contributions = [
      {
        name: "keywords",
        value: keywordContribution,
        percentage: weights.keywords,
        matches: keywordDetails.matches.length,
      },
      {
        name: "bio",
        value: bioContribution,
        percentage: weights.bio,
        matches: bioDetails.matches.length,
      },
      {
        name: "affiliation",
        value: affiliationContribution,
        percentage: weights.affiliation,
        matches: affiliationDetails.matchedParts.length,
      },
    ].sort((a, b) => b.value - a.value);

    const dominantFactor = contributions[0];
    if (dominantFactor) {
      details.push(
        `DOMINANT FACTOR: ${dominantFactor.name} contributed ${(
          dominantFactor.value * 100
        ).toFixed(1)} points (${(dominantFactor.percentage * 100).toFixed(
          0
        )}% weight, ${dominantFactor.matches} matches)`
      );
    }

    return details.join(" | ");
  }

  /**
   * Generate basic description as fallback when detailed user data is not available
   */
  private generateBasicConnectionDescription(
    similarity: UserSimilarityScore
  ): string {
    const { factors, overallScore } = similarity;

    // Get the weights used for calculation
    const weights = this.calculator.getWeights();

    // Calculate individual contributions
    const keywordContribution = factors.keywordSimilarity * weights.keywords;
    const bioContribution = factors.bioSimilarity * weights.bio;
    const affiliationContribution =
      factors.affiliationMatch * weights.affiliation;

    // Calculate the raw weighted sum (before scaling to 1-10)
    const rawWeightedSum =
      keywordContribution + bioContribution + affiliationContribution;

    // Build detailed description
    const details: string[] = [];

    // Overall similarity level
    if (overallScore >= 8) {
      details.push("VERY STRONG SIMILARITY");
    } else if (overallScore >= 6) {
      details.push("STRONG SIMILARITY");
    } else if (overallScore >= 4) {
      details.push("MODERATE SIMILARITY");
    } else {
      details.push("WEAK SIMILARITY");
    }

    // Detailed calculation breakdown
    details.push(`CALCULATION BREAKDOWN:`);
    details.push(
      `• Keywords: ${(factors.keywordSimilarity * 100).toFixed(1)}% match × ${(
        weights.keywords * 100
      ).toFixed(0)}% weight = ${(keywordContribution * 100).toFixed(1)} points`
    );
    details.push(
      `• Bio Text: ${(factors.bioSimilarity * 100).toFixed(1)}% match × ${(
        weights.bio * 100
      ).toFixed(0)}% weight = ${(bioContribution * 100).toFixed(1)} points`
    );
    details.push(
      `• Affiliation: ${(factors.affiliationMatch * 100).toFixed(
        1
      )}% match × ${(weights.affiliation * 100).toFixed(0)}% weight = ${(
        affiliationContribution * 100
      ).toFixed(1)} points`
    );
    details.push(`• Raw Sum: ${(rawWeightedSum * 100).toFixed(1)} points`);
    details.push(
      `• Final Score: ${(rawWeightedSum * 100).toFixed(
        1
      )}/100 → ${overallScore}/10`
    );

    // Factor analysis
    const factorAnalysis: string[] = [];

    if (factors.keywordSimilarity > 0.7) {
      factorAnalysis.push(
        `HIGH keyword overlap (${(factors.keywordSimilarity * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.keywordSimilarity > 0.3) {
      factorAnalysis.push(
        `MODERATE keyword overlap (${(factors.keywordSimilarity * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.keywordSimilarity > 0) {
      factorAnalysis.push(
        `LOW keyword overlap (${(factors.keywordSimilarity * 100).toFixed(1)}%)`
      );
    } else {
      factorAnalysis.push(`NO keyword overlap (0%)`);
    }

    if (factors.bioSimilarity > 0.7) {
      factorAnalysis.push(
        `HIGH bio text similarity (${(factors.bioSimilarity * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.bioSimilarity > 0.3) {
      factorAnalysis.push(
        `MODERATE bio text similarity (${(factors.bioSimilarity * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.bioSimilarity > 0) {
      factorAnalysis.push(
        `LOW bio text similarity (${(factors.bioSimilarity * 100).toFixed(1)}%)`
      );
    } else {
      factorAnalysis.push(`NO bio text similarity (0%)`);
    }

    if (factors.affiliationMatch > 0.7) {
      factorAnalysis.push(
        `HIGH affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.affiliationMatch > 0.3) {
      factorAnalysis.push(
        `MODERATE affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}%)`
      );
    } else if (factors.affiliationMatch > 0) {
      factorAnalysis.push(
        `LOW affiliation match (${(factors.affiliationMatch * 100).toFixed(
          1
        )}%)`
      );
    } else {
      factorAnalysis.push(`NO affiliation match (0%)`);
    }

    if (factorAnalysis.length > 0) {
      details.push(`FACTOR ANALYSIS: ${factorAnalysis.join(", ")}`);
    }

    // Dominant factors
    const contributions = [
      {
        name: "keywords",
        value: keywordContribution,
        percentage: weights.keywords,
      },
      { name: "bio", value: bioContribution, percentage: weights.bio },
      {
        name: "affiliation",
        value: affiliationContribution,
        percentage: weights.affiliation,
      },
    ].sort((a, b) => b.value - a.value);

    const dominantFactor = contributions[0];
    if (dominantFactor) {
      details.push(
        `DOMINANT FACTOR: ${dominantFactor.name} contributed ${(
          dominantFactor.value * 100
        ).toFixed(1)} points (${(dominantFactor.percentage * 100).toFixed(
          0
        )}% weight)`
      );
    }

    return details.join(" | ");
  }

  /**
   * Calculate similarity for a specific user against all others
   */
  async calculateSimilarityForUser(
    userId: string
  ): Promise<UserSimilarityScore[]> {
    const userProfiles = await this.dataProcessor.extractUserProfileData();
    const targetUser = userProfiles.find((profile) => profile.id === userId);

    if (!targetUser) {
      throw new Error(`User ${userId} not found`);
    }

    const similarities: UserSimilarityScore[] = [];

    for (const otherUser of userProfiles) {
      if (otherUser.id !== userId) {
        const similarity = this.calculator.calculateSimilarity(
          targetUser,
          otherUser
        );
        similarities.push(similarity);
      }
    }

    return similarities.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Get detailed similarity breakdown for two users
   */
  async getSimilarityBreakdown(
    userId1: string,
    userId2: string
  ): Promise<UserSimilarityScore | null> {
    const userProfiles = await this.dataProcessor.extractUserProfileData();
    const user1Profile = userProfiles.find((profile) => profile.id === userId1);
    const user2Profile = userProfiles.find((profile) => profile.id === userId2);

    if (!user1Profile || !user2Profile) {
      return null;
    }

    return this.calculator.calculateSimilarity(user1Profile, user2Profile);
  }

  /**
   * Recalculate similarities when a user's profile changes
   */
  async recalculateSimilaritiesForUser(userId: string): Promise<{
    updatedConnections: number;
    errors: string[];
  }> {
    console.log(`🔄 Recalculating similarities for user ${userId}...`);

    const errors: string[] = [];
    let updatedConnections = 0;

    try {
      const similarities = await this.calculateSimilarityForUser(userId);

      for (const similarity of similarities) {
        try {
          await this.updateConnectionWithSimilarity(similarity);
          updatedConnections++;
        } catch (error) {
          console.error(`Error updating connection for user ${userId}:`, error);
          errors.push(`Failed to update connection: ${error}`);
        }
      }

      console.log(
        `✅ Updated ${updatedConnections} connections for user ${userId}`
      );

      return { updatedConnections, errors };
    } catch (error) {
      console.error(
        `❌ Error recalculating similarities for user ${userId}:`,
        error
      );
      return {
        updatedConnections: 0,
        errors: [`Failed to recalculate: ${error}`],
      };
    }
  }

  /**
   * Get similarity statistics for the entire network
   */
  async getNetworkSimilarityStats(): Promise<{
    totalConnections: number;
    averageWeight: number;
    weightDistribution: { [weight: number]: number };
    highSimilarityPairs: number;
    lastCalculated: Date | null;
  }> {
    const connections = await prisma.connections.findMany({
      select: {
        weight: true,
        updatedAt: true,
      },
    });

    const weightDistribution: { [weight: number]: number } = {};
    let totalWeight = 0;
    let highSimilarityPairs = 0;
    let lastCalculated: Date | null = null;

    connections.forEach((conn) => {
      const weight = conn.weight;
      totalWeight += weight;

      weightDistribution[weight] = (weightDistribution[weight] || 0) + 1;

      if (weight >= 7) {
        highSimilarityPairs++;
      }

      if (!lastCalculated || conn.updatedAt > lastCalculated) {
        lastCalculated = conn.updatedAt;
      }
    });

    return {
      totalConnections: connections.length,
      averageWeight:
        connections.length > 0 ? totalWeight / connections.length : 0,
      weightDistribution,
      highSimilarityPairs,
      lastCalculated,
    };
  }
}
