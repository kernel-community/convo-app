import type { Prisma } from "@prisma/client";
import { EventType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import * as crypto from "crypto";
import { faker } from "@faker-js/faker";
import { range } from "lodash";

const prisma = new PrismaClient();

const randomTimeSelector = () => {
  const when = faker.datatype.number({
    max: 3,
    min: 1,
  });
  switch (when) {
    case 1:
      return "past";
    case 2:
      return "future";
    case 3:
      return "soon";
  }
};

const generateRandomEvent = (options?: {
  title?: string;
  descriptionHtml?: string | null;
  location?: string;
  hash?: string;
  limit?: number;
  proposer?: {
    address: string;
  };
}): Prisma.EventCreateArgs => {
  const when = randomTimeSelector();
  const start =
    when === "past"
      ? faker.date.past()
      : when === "future"
      ? faker.date.future()
      : faker.date.soon();
  const end = DateTime.fromJSDate(start).plus({ hour: 1 }).toJSDate();
  return {
    data: {
      title:
        options?.title ||
        faker.word.preposition() +
          " " +
          faker.word.adjective() +
          " " +
          faker.word.noun(),
      descriptionHtml:
        options?.descriptionHtml || "<p>" + faker.lorem.paragraphs(3) + "</p>",
      startDateTime: start,
      endDateTime: end,
      location: options?.location || "url:" + faker.internet.url(),
      hash: options?.hash || faker.random.alphaNumeric(5),
      series: !!options?.hash,
      limit: options?.limit || Number(faker.random.numeric(2)),
      type: EventType.JUNTO,
      proposer: options?.proposer
        ? {
            connect: {
              address: options.proposer.address,
            },
          }
        : {
            create: {
              address: "0x" + crypto.randomBytes(20).toString("hex"),
            },
          },
    },
  };
};

const generateRandomSeriesEvents = () => {
  const numberOfEventsInSeries = Number(
    faker.random.numeric(1, { bannedDigits: ["0", "1"] })
  );
  const event = generateRandomEvent();
  const { data } = event;
  const { title, descriptionHtml, location, hash, limit, proposer } = data;
  return range(0, numberOfEventsInSeries).map(() =>
    generateRandomEvent({
      title,
      descriptionHtml,
      location,
      hash,
      limit,
      proposer: {
        address:
          proposer?.create?.address || crypto.randomBytes(20).toString("hex"),
      },
    })
  );
};

const generateRandomUser = (): Prisma.UserUpsertArgs => {
  const address = crypto.randomBytes(20).toString("hex");

  return {
    where: { address },
    create: { address },
    update: { address },
  };
};

const seed = async () => {
  const USERS = 5;
  const EVENTS = 20;
  const SERIES_EVENTS = 4;

  const users = range(0, USERS).map(() =>
    prisma.user.upsert({
      ...generateRandomUser(),
    })
  );
  const events = range(0, EVENTS).map(() =>
    prisma.event.create({
      ...generateRandomEvent(),
    })
  );
  const seriesEvents = range(0, SERIES_EVENTS).map(() =>
    generateRandomSeriesEvents()
  );
  const series = seriesEvents
    .map((series) => series.map((event) => prisma.event.create(event)))
    .flat(1);
  const seriesProposers = seriesEvents
    .map((series) =>
      series.map((event) => {
        const address = event.data.proposer?.connect?.address;
        if (address) {
          return prisma.user.upsert({
            where: { address },
            create: { address },
            update: { address },
          });
        }
      })
    )
    .flat(1);
  await Promise.all([...seriesProposers]);
  await Promise.all([...users, ...events, ...series]);
};

seed();
