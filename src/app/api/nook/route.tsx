// app/api/nook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "src/utils/db";

export async function GET() {
  try {
    // Step 1: Get all users with their events and RSVPs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        events: {
          select: {
            id: true,
          },
          where: {
            isDeleted: false,
          },
        },
        rsvps: {
          select: {
            id: true,
            eventId: true,
            rsvpType: true,
          },
          where: {
            rsvpType: "GOING", // Only count confirmed attendance
          },
        },
      },
    });

    // Step 2: Map user data to nodes array
    const nodes = users.map((user) => ({
      id: user.id,
      name: user.nickname,
      eventsCreated: user.events.length,
      rsvps: user.rsvps.length,
    }));

    // Step 3: Create an efficient map of users attending each event
    const eventAttendees: Record<string, string[]> = {};

    // Populate the eventAttendees map
    for (const user of users) {
      for (const rsvp of user.rsvps) {
        const eventId = rsvp.eventId;
        // Initialize the array if it doesn't exist
        if (!eventAttendees[eventId]) {
          eventAttendees[eventId] = [];
        }
        // At this point, we know eventAttendees[eventId] is defined
        if (user.id) {
          eventAttendees[eventId]?.push(user.id);
        }
      }
    }

    // Step 4: Build connections between users who attend the same events
    const connections: Record<string, Record<string, number>> = {};

    // Calculate connection strengths based on shared events
    Object.values(eventAttendees).forEach((attendees) => {
      // Only process events with multiple attendees
      if (attendees.length > 1) {
        // Compare each pair of attendees
        for (let i = 0; i < attendees.length; i++) {
          for (let j = i + 1; j < attendees.length; j++) {
            const user1 = attendees[i];
            const user2 = attendees[j];

            // Initialize connection record if needed
            // Ensure both users exist before creating connections
            if (user1 && user2) {
              // Initialize connection record if needed
              if (!connections[user1]) {
                connections[user1] = {};
              }
              if (!connections[user2]) {
                connections[user2] = {};
              }

              // Increment connection strength
              // Create a helper function to safely update connection strength
              const updateConnection = (fromUser: string, toUser: string) => {
                const fromUserConnections = connections[fromUser];
                if (fromUserConnections) {
                  const currentStrength = fromUserConnections[toUser] || 0;
                  fromUserConnections[toUser] = currentStrength + 1;
                }
              };

              // Update connections in both directions
              updateConnection(user1, user2);
              updateConnection(user2, user1);
            }
          }
        }
      }
    });

    // Step 5: Convert connections to links array
    const links: { source: string; target: string; value: number }[] = [];
    const processedPairs = new Set<string>();

    for (const [source, targets] of Object.entries(connections)) {
      for (const [target, value] of Object.entries(targets)) {
        // Create a unique ID for this user pair (alphabetically ordered to avoid duplicates)
        const pairId = [source, target].sort().join("-");

        // Only process each pair once
        if (!processedPairs.has(pairId)) {
          processedPairs.add(pairId);

          // Only include meaningful connections (attended at least 2 events together)
          if (value >= 2) {
            links.push({
              source,
              target,
              value,
            });
          }
        }
      }
    }

    // Optional: Limit the number of connections to avoid overloading the visualization
    // Sort by connection strength and take the top N
    const topLinks = links.sort((a, b) => b.value - a.value).slice(0, 300); // Adjust number as needed

    return NextResponse.json({ nodes, links: topLinks });
  } catch (error) {
    console.error("Error generating network data:", error);
    return NextResponse.json(
      { error: "Failed to generate network data" },
      { status: 500 }
    );
  }
}
