import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";
import { getDefaultProfilePicture } from "src/utils/constants";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";

export async function GET(request: NextRequest) {
  try {
    // Get the community for the current subdomain
    const community = await getCommunityFromSubdomain();

    // Fetch all users with their community-specific profiles, events, and RSVPs
    const users = await prisma.user.findMany({
      include: {
        profiles: {
          where: {
            communityId: community.id,
          },
          take: 1,
        },
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

      // Get the community-specific profile (first one from the filtered array)
      const profile =
        user.profiles && user.profiles.length > 0 ? user.profiles[0] : null;

      return {
        id: user.id,
        name: user.nickname || "Anonymous",
        type: "user" as const,
        convo: {
          eventsCreated: eventsCreated,
          rsvps: user.rsvps.length,
        },
        profile: {
          image: profile?.image || defaultImage,
          keywords: profile?.keywords || [],
          bio:
            profile?.bio ||
            `${user.nickname || "Anonymous"} is exploring the web3 space.`,
          currentAffiliation: profile?.currentAffiliation || "Independent",
          url: profile?.url || "#",
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
