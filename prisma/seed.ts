import {
  PrismaClient,
  EventType,
  LocationType,
  RSVP_TYPE,
} from "@prisma/client";
import { DateTime } from "luxon";
// Simple hash generator for seed data
function generateHash(length = 10): string {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

const prisma = new PrismaClient();

// Helper functions for random data generation
function getRandomFutureDate(minDays = 1, maxDays = 30) {
  const daysToAdd =
    Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const hoursToAdd = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  return DateTime.now()
    .plus({ days: daysToAdd })
    .set({ hour: hoursToAdd, minute: 0 });
}

function getRandomPastDate(minDays = 1, maxDays = 30) {
  const daysToSubtract =
    Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const hoursToAdd = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  return DateTime.now()
    .minus({ days: daysToSubtract })
    .set({ hour: hoursToAdd, minute: 0 });
}

function getRandomDuration() {
  return Math.floor(Math.random() * 2) + 1; // 1 to 2 hours
}

const eventTitles = [
  "Web3 Social Meetup: Building Decentralized Communities",
  "Technical Writing Workshop: Documenting Web3 Projects",
  "Smart Contract Security Workshop: Best Practices",
  "Community Building Session: Growing Your DAO",
  "DeFi Deep Dive: Understanding Liquidity Protocols",
  "Zero Knowledge Proofs: From Theory to Practice",
  "Scaling Ethereum: Layer 2 Solutions Explained",
  "NFT Art & Culture: Beyond the Hype",
  "DAO Governance: Decision Making in Web3",
  "Blockchain for Social Impact: Real World Applications",
  "Cryptography Fundamentals for Web3",
  "Sustainable Blockchain: Energy Efficient Protocols",
  "Web3 UX Design Workshop",
  "Smart Contract Development with Solidity",
  "Cross-chain Interoperability Discussion",
];

const eventDescriptions = [
  "Join us for an engaging session where we'll explore the latest developments in decentralized technology. We'll discuss real-world applications, challenges, and opportunities in the Web3 space. Bring your questions and ideas!",
  "A hands-on workshop designed to help participants understand and communicate complex technical concepts effectively. Perfect for developers, technical writers, and anyone interested in improving their documentation skills.",
  "Deep dive into fundamental and advanced concepts with industry experts. We'll cover security best practices, common vulnerabilities, and practical techniques for building robust systems.",
  "Connect with like-minded individuals and learn from shared experiences in building and growing communities. This session will focus on practical strategies for community engagement and sustainable growth.",
  "Interactive session covering both practical applications and theoretical foundations. We'll explore current trends, examine case studies, and discuss future possibilities in the ecosystem.",
  "A beginner-friendly introduction to key concepts and technologies. Perfect for those looking to understand the basics and start their Web3 journey.",
  "Advanced technical session diving deep into protocol-level details. Recommended for experienced developers and researchers.",
  "Join us for a thoughtful discussion on the intersection of technology and society. We'll explore how Web3 can address real-world challenges.",
];

const locations = [
  "Kernel House, 123 Web3 Street, San Francisco",
  "Ethereum Foundation Hub, Market Street, San Francisco",
  "Decentralized Cafe, Mission District, SF",
  "Web3 Community Center, SOMA, San Francisco",
  "https://meet.kernel.community/junto",
  "https://gather.town/kernel-space",
  "https://discord.gg/kernel-community",
];

const userProfiles = [
  {
    email: "angela@kernel.community",
    nickname: "Angela",
    bio: "Building Convo at Kernel. Passionate about community, technology, and bringing people together.",
  },
  {
    email: "vivek@kernel.community",
    nickname: "Vivek",
    bio: "Engineering Lead at Kernel. Focused on building tools that empower communities.",
  },
  {
    email: "paul@kernel.community",
    nickname: "Paul",
    bio: "Learning and teaching at Kernel. Exploring the intersection of education and Web3.",
  },
  {
    email: "sarah@kernel.community",
    nickname: "Sarah",
    bio: "Community Lead at Kernel. Building bridges between technology and people.",
  },
  {
    email: "alex@kernel.community",
    nickname: "Alex",
    bio: "Research at Kernel. Working on governance and coordination systems.",
  },
  {
    email: "maya@kernel.community",
    nickname: "Maya",
    bio: "Designer at Kernel. Creating intuitive experiences in Web3.",
  },
];

function getRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot get random item from empty array");
  }
  const index = Math.floor(Math.random() * array.length);
  const item = array[index];
  // Since we checked length, we know this must exist
  if (item === undefined) {
    throw new Error(
      `Unexpected undefined at index ${index} in non-empty array`
    );
  }
  return item;
}

async function main() {
  // Clean up existing data
  await prisma.rsvp.deleteMany();
  await prisma.email.deleteMany();
  await prisma.event.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all(
    userProfiles.map((profile) =>
      prisma.user.create({
        data: {
          email: profile.email,
          nickname: profile.nickname,
          profile: {
            create: {
              bio: profile.bio,
            },
          },
        },
      })
    )
  );

  // Create events
  const futureEvents = await Promise.all(
    Array(10)
      .fill(null)
      .map(async (_, i) => {
        const startDate = getRandomFutureDate();
        const duration = getRandomDuration();
        const endDate = startDate.plus({ hours: duration });
        const isOnline = Math.random() > 0.5;

        // Filter locations with fallback
        const filteredLocations = locations.filter((loc) =>
          isOnline ? loc.startsWith("http") : !loc.startsWith("http")
        );
        const location =
          filteredLocations.length > 0
            ? getRandomItem(filteredLocations)
            : isOnline
            ? "https://meet.kernel.community/junto" // Default online location
            : "Kernel House, San Francisco"; // Default physical location

        return prisma.event.create({
          data: {
            title: getRandomItem(eventTitles),
            descriptionHtml: getRandomItem(eventDescriptions),
            startDateTime: startDate.toJSDate(),
            endDateTime: endDate.toJSDate(),
            location,
            locationType: isOnline ? LocationType.ONLINE : LocationType.MAP,
            limit: Math.floor(Math.random() * 50) + 20, // 20 to 70 people
            type: EventType.JUNTO,
            proposerId: getRandomItem(users).id,
            hash: generateHash(10),
            series: Math.random() > 0.8, // 20% chance of being a series
          },
        });
      })
  );

  // Create past events
  const pastEvents = await Promise.all(
    Array(3)
      .fill(null)
      .map(async (_, i) => {
        const startDate = getRandomPastDate(1, 30); // Past events from last 30 days
        const duration = getRandomDuration();
        const endDate = startDate.plus({ hours: duration });
        const isOnline = Math.random() > 0.5;

        const filteredLocations = locations.filter((loc) =>
          isOnline ? loc.startsWith("http") : !loc.startsWith("http")
        );
        const location =
          filteredLocations.length > 0
            ? getRandomItem(filteredLocations)
            : isOnline
            ? "https://meet.kernel.community/junto"
            : "Kernel House, San Francisco";

        return prisma.event.create({
          data: {
            title: getRandomItem(eventTitles),
            descriptionHtml: getRandomItem(eventDescriptions),
            startDateTime: startDate.toJSDate(),
            endDateTime: endDate.toJSDate(),
            location,
            locationType: isOnline ? LocationType.ONLINE : LocationType.MAP,
            limit: Math.floor(Math.random() * 50) + 20,
            type: EventType.JUNTO,
            proposerId: getRandomItem(users).id,
            hash: generateHash(10),
            series: false, // Past events don't need to be series
          },
        });
      })
  );

  const events = [...futureEvents, ...pastEvents];

  // Create RSVPs - Generate multiple RSVPs for each event
  const rsvps = await Promise.all(
    events.flatMap((event) => {
      // Get available attendees (excluding proposer)
      const availableAttendees = users.filter(
        (user) => user.id !== event.proposerId
      );

      // Randomly select 2-5 unique attendees
      const numRsvps = Math.min(
        Math.floor(Math.random() * 4) + 2,
        availableAttendees.length
      );

      // Shuffle available attendees and take the first numRsvps
      const selectedAttendees = [...availableAttendees]
        .sort(() => Math.random() - 0.5)
        .slice(0, numRsvps);

      // Create RSVPs for selected attendees
      return selectedAttendees.map((attendee) =>
        prisma.rsvp.create({
          data: {
            eventId: event.id,
            attendeeId: attendee.id,
            rsvpType: getRandomItem([
              RSVP_TYPE.GOING,
              RSVP_TYPE.MAYBE,
              RSVP_TYPE.GOING,
            ]), // Bias towards GOING
          },
        })
      );
    })
  );

  console.log({
    users: users.length,
    events: events.length,
    rsvps: rsvps.length,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
