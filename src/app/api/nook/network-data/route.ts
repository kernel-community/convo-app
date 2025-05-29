import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { getDefaultProfilePicture } from "src/utils/constants";

export async function GET(request: NextRequest) {
  try {
    // Fetch all users with their profiles, events, and RSVPs
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        collections: {
          include: {
            events: true,
          },
        },
        rsvps: true,
        proposedEvents: true,
      },
    });

    // Fetch all connections
    const connections = await prisma.connections.findMany({
      select: {
        fromId: true,
        toId: true,
        weight: true,
        description: true,
      },
    });

    // Transform users into nodes format
    const nodes = users.map((user) => {
      // Count events created (events in collections + proposed events)
      const eventsInCollections = user.collections.reduce(
        (total, collection) => total + collection.events.length,
        0
      );
      const eventsCreated = eventsInCollections + user.proposedEvents.length;

      // Get deterministic default image based on user ID
      const defaultImage = getDefaultProfilePicture(user.id);

      return {
        id: user.id,
        name: user.nickname || "Anonymous",
        type: "user" as const,
        convo: {
          eventsCreated: eventsCreated,
          rsvps: user.rsvps.length,
        },
        profile: {
          image: user.profile?.image || defaultImage,
          keywords: user.profile?.keywords || [],
          bio:
            user.profile?.bio ||
            `${user.nickname || "Anonymous"} is exploring the web3 space.`,
          currentAffiliation: user.profile?.currentAffiliation || "Independent",
          url: user.profile?.url || "#",
        },
      };
    });

    // Transform connections into links format
    const links = connections.map((connection) => ({
      source: connection.fromId,
      target: connection.toId,
      weight: connection.weight,
      description: connection.description,
    }));

    // Return data in the exact same format as mock.ts
    const data = {
      nodes,
      links,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching network data:", error);
    return NextResponse.json(
      { error: "Failed to fetch network data" },
      { status: 500 }
    );
  }
}
