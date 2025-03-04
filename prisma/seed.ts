import {
  PrismaClient,
  EventType,
  LocationType,
  RSVP_TYPE,
} from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.rsvp.deleteMany();
  await prisma.email.deleteMany();
  await prisma.event.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "angela@kernel.community",
        nickname: "Angela",
        profile: {
          create: {
            bio: "Building Convo at Kernel",
            photo: "https://avatars.githubusercontent.com/u/26520289",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "vivek@kernel.community",
        nickname: "Vivek",
        profile: {
          create: {
            bio: "Engineering Lead at Kernel",
            photo: "https://avatars.githubusercontent.com/u/1309829",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "paul@kernel.community",
        nickname: "Paul",
        profile: {
          create: {
            bio: "Learning and teaching at Kernel",
            photo: "https://kernel.community/images/paul.png",
          },
        },
      },
    }),
  ]);

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Kernel Community Call",
        descriptionHtml:
          "Weekly community call to discuss ongoing projects and share updates.",
        startDateTime: DateTime.now()
          .plus({ days: 2 })
          .set({ hour: 9, minute: 0 })
          .toJSDate(),
        endDateTime: DateTime.now()
          .plus({ days: 2 })
          .set({ hour: 10, minute: 0 })
          .toJSDate(),
        location: "https://meet.kernel.community/community-call",
        locationType: LocationType.ONLINE,
        limit: 100,
        type: EventType.JUNTO,
        proposerId: users[0].id,
        hash: "kernel-community-call",
        series: false,
      },
    }),
    prisma.event.create({
      data: {
        title: "Web3 Social Meetup",
        descriptionHtml:
          "In-person meetup to discuss the future of web3 social applications.",
        startDateTime: DateTime.now()
          .plus({ days: 7 })
          .set({ hour: 18, minute: 30 })
          .toJSDate(),
        endDateTime: DateTime.now()
          .plus({ days: 7 })
          .set({ hour: 20, minute: 30 })
          .toJSDate(),
        location: "Ethereum Foundation Hub, San Francisco",
        locationType: LocationType.MAP,
        limit: 50,
        type: EventType.JUNTO,
        proposerId: users[1].id,
        hash: "web3-social-meetup",
        series: false,
      },
    }),
    prisma.event.create({
      data: {
        title: "Technical Writing Workshop",
        descriptionHtml:
          "Learn how to write clear, concise technical documentation for your projects.",
        startDateTime: DateTime.now()
          .plus({ days: 14 })
          .set({ hour: 15, minute: 0 })
          .toJSDate(),
        endDateTime: DateTime.now()
          .plus({ days: 14 })
          .set({ hour: 16, minute: 30 })
          .toJSDate(),
        location: "https://meet.kernel.community/workshop",
        locationType: LocationType.ONLINE,
        limit: 30,
        type: EventType.JUNTO,
        proposerId: users[2].id,
        hash: "tech-writing-workshop",
        series: false,
      },
    }),
  ]);

  // Create RSVPs
  const rsvps = await Promise.all([
    // RSVPs for Kernel Community Call
    prisma.rsvp.create({
      data: {
        eventId: events[0].id,
        attendeeId: users[1].id,
        rsvpType: RSVP_TYPE.GOING,
      },
    }),
    prisma.rsvp.create({
      data: {
        eventId: events[0].id,
        attendeeId: users[2].id,
        rsvpType: RSVP_TYPE.MAYBE,
      },
    }),
    // RSVPs for Web3 Social Meetup
    prisma.rsvp.create({
      data: {
        eventId: events[1].id,
        attendeeId: users[0].id,
        rsvpType: RSVP_TYPE.GOING,
      },
    }),
    prisma.rsvp.create({
      data: {
        eventId: events[1].id,
        attendeeId: users[2].id,
        rsvpType: RSVP_TYPE.GOING,
      },
    }),
    // RSVPs for Technical Writing Workshop
    prisma.rsvp.create({
      data: {
        eventId: events[2].id,
        attendeeId: users[0].id,
        rsvpType: RSVP_TYPE.GOING,
      },
    }),
    prisma.rsvp.create({
      data: {
        eventId: events[2].id,
        attendeeId: users[1].id,
        rsvpType: RSVP_TYPE.MAYBE,
      },
    }),
  ]);

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
