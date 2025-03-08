import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the event types to be updated
const typesToUpdate = ["INTERVIEW", "TEST"];

async function updateEventTypes() {
  try {
    // Count events with types to be updated
    const countsByType = await Promise.all(
      typesToUpdate.map(async (type) => {
        const count = await prisma.event.count({
          where: {
            type: type as any,
          },
        });
        return { type, count };
      })
    );

    const totalCount = countsByType.reduce((sum, { count }) => sum + count, 0);

    countsByType.forEach(({ type, count }) => {
      console.log(`Found ${count} events with type "${type}"`);
    });
    console.log(`Total events to update: ${totalCount}`);

    if (totalCount > 0) {
      // Update all events with specified types to "UNLISTED" using raw SQL
      // This avoids issues with enum handling in Prisma

      // Create a new PrismaClient instance with direct connection to avoid PgBouncer issues
      // This is important based on the Supabase with PgBouncer configuration requirements
      const directPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DIRECT_URL,
          },
        },
      });

      try {
        // Convert types to SQL-safe format with quotes
        const typesForSQL = typesToUpdate.map((type) => `'${type}'`).join(", ");

        // Use raw SQL query with direct connection
        const result = await directPrisma.$executeRawUnsafe(`
          UPDATE "Event" 
          SET "type" = 'UNLISTED' 
          WHERE "type" IN (${typesForSQL})
        `);

        console.log(`Successfully updated ${result} events to "UNLISTED"`);
      } finally {
        // Disconnect the direct connection client
        await directPrisma.$disconnect();
      }

      // Verify the update
      const afterCounts = await Promise.all(
        typesToUpdate.map(async (type) => {
          const count = await prisma.event.count({
            where: {
              type: type as any,
            },
          });
          return { type, count };
        })
      );

      afterCounts.forEach(({ type, count }) => {
        console.log(`Remaining events with type "${type}": ${count}`);
      });

      const unlistedCount = await prisma.event.count({
        where: {
          type: "UNLISTED",
        },
      });

      console.log(`Total events with type "UNLISTED": ${unlistedCount}`);
    } else {
      console.log("No events with specified types found. No updates needed.");
    }
  } catch (error) {
    console.error("Error updating events:", error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the function
updateEventTypes()
  .then(() => console.log("Script completed"))
  .catch((error) => console.error("Script failed:", error));
