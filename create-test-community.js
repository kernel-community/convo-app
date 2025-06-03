const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestCommunity() {
  try {
    console.log("Creating test community...");

    // Create a test community
    const testCommunity = await prisma.community.create({
      data: {
        subdomain: "test",
        displayName: "Test Community",
        description: "Test community for profile pre-population testing",
      },
    });

    console.log("Test community created:", testCommunity);
    console.log("✅ Test community setup completed!");
  } catch (error) {
    console.error("❌ Error creating test community:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCommunity();
