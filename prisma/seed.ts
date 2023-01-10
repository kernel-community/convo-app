import { EventType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const user1 = {
    email: "example1@domain.com",
    username: "angg"
  }
  const user2 = {
    email: "example2@domain.com",
    username: "anggk"
  }
  const user3 = {
    email: "example3@domain.com",
    username: "new-user"
  }

  const u1 = await prisma.user.upsert({
    where: { email: user1.email },
    create: user1,
    update: user1
  })

  const u2 = await prisma.user.upsert({
    where: { email: user2.email },
    create: user2,
    update: user2
  })

  const u3 = await prisma.user.upsert({
    where: { email: user3.email },
    create: user3,
    update: user3
  })


  const event1 = {
    title: "New Junto1",
    descriptionHtml: "<p>Hello!</p>",
    descriptionText: "Hello!",
    startDateTime: new Date(),
    endDateTime: new Date(Date.now() + (3600 * 1000 * 24)),
    location: "url:1",
    hash: "hash1",
    series: false,
    limit: 12,
    type: EventType.JUNTO,
    proposer: {
      connect: {email: user1.email}
    }
  }
  const event2 = {
    title: "New Junto2",
    descriptionHtml: "<p>Hello!</p>",
    descriptionText: "Hello!",
    startDateTime: new Date(),
    endDateTime: new Date(Date.now() + (3600 * 1000 * 24)),
    location: "url:1",
    hash: "hash2",
    series: false,
    limit: 12,
    type: EventType.JUNTO,
    proposer: {
      connect: { email: user2.email }
    }
  }
  const e1 = await prisma.event.create({ data: event1 });
  const e2 = await prisma.event.create({ data: event2 });

  await prisma.rsvp.create({data: { eventId: e1.id, attendeeId: u3.id }});
  await prisma.rsvp.create({data: { eventId: e2.id, attendeeId: u3.id }});
}

seed ();

export {}
