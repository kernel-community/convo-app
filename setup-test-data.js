const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log("Setting up test data...");

    // Check if test user exists
    let user = await prisma.user.findUnique({
      where: { id: "test-user-123" },
    });

    if (!user) {
      // Create test user
      console.log("Creating test user...");
      user = await prisma.user.create({
        data: {
          id: "test-user-123",
          nickname: "TestUser",
          email: "test@example.com",
        },
      });
      console.log("Test user created:", user);
    } else {
      console.log("Test user already exists:", user);
    }

    // Check all communities
    const communities = await prisma.community.findMany({
      select: { id: true, subdomain: true, displayName: true, createdAt: true },
    });
    console.log("Available communities:", communities);

    // Check for ALL dev communities
    const devCommunities = await prisma.community.findMany({
      where: { subdomain: "dev" },
    });
    console.log("Dev communities found:", devCommunities.length);
    devCommunities.forEach((community, index) => {
      console.log(`  Dev community ${index + 1}:`, {
        id: community.id,
        displayName: community.displayName,
        createdAt: community.createdAt,
      });
    });

    // Check existing profiles for our test user
    const existingProfiles = await prisma.profile.findMany({
      where: { userId: "test-user-123" },
      include: {
        community: { select: { subdomain: true, displayName: true } },
      },
    });
    console.log("Existing profiles for test user:", existingProfiles);

    console.log("✅ Test data setup completed!");
  } catch (error) {
    console.error("❌ Error setting up test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
