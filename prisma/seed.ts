import type { Prisma } from "@prisma/client";
import { EventType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const user1: Prisma.UserUpsertArgs = {
    where: {
      email: "example1@domain.com",
    },
    create: {
      username: "new-user1",
      email: "example1@domain.com",
    },
    update: {
      username: "new-user1",
      email: "example1@domain.com",
    },
  };
  const user2: Prisma.UserUpsertArgs = {
    where: {
      email: "example2@domain.com",
    },
    create: {
      username: "new-user2",
      email: "example2@domain.com",
    },
    update: {
      username: "new-user2",
      email: "example2@domain.com",
    },
  };
  const user3: Prisma.UserUpsertArgs = {
    where: {
      email: "example3@domain.com",
    },
    create: {
      username: "new-user3",
      email: "example3@domain.com",
    },
    update: {
      username: "new-user3",
      email: "example3@domain.com",
    },
  };

  const u1 = await prisma.user.upsert({ ...user1 });

  const u2 = await prisma.user.upsert({ ...user2 });

  const u3 = await prisma.user.upsert({ ...user3 });

  const event1: Prisma.EventCreateArgs = {
    data: {
      title: "New Junto1",
      descriptionHtml: "<p>Hello! for junto 1</p>",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600 * 1000 * 24),
      location: "url:1",
      hash: "hash1",
      series: false,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user1.where,
      },
    },
  };
  const event2: Prisma.EventCreateArgs = {
    data: {
      title: "New Junto2",
      descriptionHtml: "<p>Hello! for junto 2</p>",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600 * 1000 * 24),
      location: "url:1",
      hash: "hash2",
      series: false,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2.where,
      },
    },
  };

  const seriesEvent1: Prisma.EventCreateArgs = {
    data: {
      title: "New Series event 1",
      descriptionHtml: "<p>Hello! for series junto 2</p>",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600 * 1000 * 24),
      location: "url:1",
      hash: "hash3",
      series: true,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2.where,
      },
    },
  };

  const seriesEvent2: Prisma.EventCreateArgs = {
    data: {
      title: "New Series event 2",
      descriptionHtml: "<p>Hello! for series junto 2</p>",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600 * 1000 * 24),
      location: "url:1",
      hash: "hash3",
      series: true,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2.where,
      },
    },
  };
  const e1 = await prisma.event.create({ ...event1 });
  const e2 = await prisma.event.create({ ...event2 });
  const s1 = await prisma.event.create({ ...seriesEvent1 });
  const s2 = await prisma.event.create({ ...seriesEvent2 });

  await prisma.rsvp.create({ data: { eventId: e1.id, attendeeId: u3.id } });
  await prisma.rsvp.create({ data: { eventId: e2.id, attendeeId: u3.id } });

  await prisma.rsvp.create({ data: { eventId: s1.id, attendeeId: u3.id } });
  await prisma.rsvp.create({ data: { eventId: s1.id, attendeeId: u2.id } });

  await prisma.rsvp.create({ data: { eventId: s2.id, attendeeId: u3.id } });
  await prisma.rsvp.create({ data: { eventId: s2.id, attendeeId: u2.id } });
};

seed();
