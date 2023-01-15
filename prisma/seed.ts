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

const generateRandomEvent = (hash?: string): Prisma.EventCreateArgs => {
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
        faker.word.preposition() +
        " " +
        faker.word.adjective() +
        " " +
        faker.word.noun(),
      descriptionHtml: "<p>" + faker.lorem.paragraphs(3) + "</p>",
      startDateTime: start,
      endDateTime: end,
      location: "url:" + faker.internet.url(),
      hash: hash || faker.random.alphaNumeric(5),
      series: !!hash,
      limit: Number(faker.random.numeric(2)),
      type: EventType.JUNTO,
      proposer: {
        create: {
          address: "0x" + crypto.randomBytes(20).toString("hex"),
        },
      },
    },
  };
};

const generateRandomSeriesEvents = () => {
  const numberOfEventsInSeries = Number(
    faker.random.numeric(1, { bannedDigits: "0" })
  );
  const randomHash = faker.random.alphaNumeric(5);
  console.log({ numberOfEventsInSeries });
  return range(0, numberOfEventsInSeries).map(() =>
    generateRandomEvent(randomHash)
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
  const series = range(0, SERIES_EVENTS)
    .map(() => generateRandomSeriesEvents())
    .map((series) => series.map((event) => prisma.event.create(event)))
    .flat(1);

  await Promise.all([...users, ...events, ...series]);
};

seed();
