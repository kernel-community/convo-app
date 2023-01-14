import type { Prisma } from "@prisma/client";
import { EventType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import * as crypto from "crypto";

const prisma = new PrismaClient();

const seed = async () => {
  const user1 = {
    address: "0x" + crypto.randomBytes(20).toString("hex"),
  };
  const user2 = {
    address: "0x" + crypto.randomBytes(20).toString("hex"),
  };
  const user3 = {
    address: "0x" + crypto.randomBytes(20).toString("hex"),
  };
  const user1Upsert: Prisma.UserUpsertArgs = {
    where: {
      address: user1.address,
    },
    create: {
      address: user1.address,
    },
    update: {
      address: user1.address,
    },
  };
  const user2Upsert: Prisma.UserUpsertArgs = {
    where: {
      address: user2.address,
    },
    create: {
      address: user2.address,
    },
    update: {
      address: user2.address,
    },
  };
  const user3Upsert: Prisma.UserUpsertArgs = {
    where: {
      address: user3.address,
    },
    create: {
      address: user3.address,
    },
    update: {
      address: user3.address,
    },
  };

  const u1 = await prisma.user.upsert({ ...user1Upsert });

  const u2 = await prisma.user.upsert({ ...user2Upsert });

  const u3 = await prisma.user.upsert({ ...user3Upsert });

  const event1: Prisma.EventCreateArgs = {
    data: {
      title: "New Junto1",
      descriptionHtml: "<p>Hello! for junto 1</p>",
      startDateTime: DateTime.now().toJSDate(),
      endDateTime: DateTime.now().plus({ hour: 4 }).toJSDate(),
      location: "url:1",
      hash: "hash1",
      series: false,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user1Upsert.where,
      },
    },
  };
  const event2: Prisma.EventCreateArgs = {
    data: {
      title: "New Junto2",
      descriptionHtml: "<p>Hello! for junto 2</p>",
      startDateTime: DateTime.now().plus({ day: 1 }).toJSDate(),
      endDateTime: DateTime.now().plus({ day: 1, hour: 1 }).toJSDate(),
      location: "url:1",
      hash: "hash2",
      series: false,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2Upsert.where,
      },
    },
  };

  const seriesEvent1: Prisma.EventCreateArgs = {
    data: {
      title: "New Series event 1",
      descriptionHtml: "<p>Hello! for series junto 2</p>",
      startDateTime: DateTime.now().plus({ day: 2 }).toJSDate(),
      endDateTime: DateTime.now().plus({ day: 2, hour: 1 }).toJSDate(),
      location: "url:1",
      hash: "hash3",
      series: true,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2Upsert.where,
      },
    },
  };

  const seriesEvent2: Prisma.EventCreateArgs = {
    data: {
      title: "New Series event 2",
      descriptionHtml: "<p>Hello! for series junto 2</p>",
      startDateTime: DateTime.now().plus({ day: 3 }).toJSDate(),
      endDateTime: DateTime.now().plus({ day: 3, hour: 1 }).toJSDate(),
      location: "url:1",
      hash: "hash3",
      series: true,
      limit: 12,
      type: EventType.JUNTO,
      proposer: {
        connect: user2Upsert.where,
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
