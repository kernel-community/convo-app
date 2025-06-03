#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setWwwCommunityForProfiles() {
  try {
    console.log("🔍 Looking for community with subdomain \"www\"...");

    // Find the community with subdomain 'www'
    const wwwCommunity = await prisma.community.findUnique({
      where: { subdomain: "www" }
    });

    if (!wwwCommunity) {
      console.error("❌ Community with subdomain \"www\" not found");
      console.log("Available communities:");
      const communities = await prisma.community.findMany({
        select: { id: true, subdomain: true, displayName: true }
      });
      console.table(communities);
      return;
    }

    console.log(`✅ Found www community: ${wwwCommunity.displayName} (${wwwCommunity.id})`);

    // Count profiles without community
    const profilesWithoutCommunity = await prisma.profile.count({
      where: { communityId: null }
    });

    console.log(`📊 Found ${profilesWithoutCommunity} profiles without a community`);

    if (profilesWithoutCommunity === 0) {
      console.log("✨ All profiles already have a community assigned");
      return;
    }

    // Update profiles without community to use www community
    const result = await prisma.profile.updateMany({
      where: { communityId: null },
      data: { communityId: wwwCommunity.id }
    });

    console.log(`✅ Successfully updated ${result.count} profiles to use www community`);

    // Verify the update
    const remainingProfilesWithoutCommunity = await prisma.profile.count({
      where: { communityId: null }
    });

    console.log(`📊 Profiles still without community: ${remainingProfilesWithoutCommunity}`);

  } catch (error) {
    console.error("❌ Error updating profiles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setWwwCommunityForProfiles();