import { PrismaClient } from "@prisma/client";

import { env } from "../env/server.mjs";
import { sanitizeDescription } from "./sanitizeDescription";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  }).$extends({
    query: {
      event: {
        create: ({ args, query }) => {
          if (args.data.descriptionHtml !== undefined) {
            args.data.descriptionHtml = sanitizeDescription(
              args.data.descriptionHtml
            );
          }
          return query(args);
        },
        update: ({ args, query }) => {
          if (args.data.descriptionHtml !== undefined) {
            args.data.descriptionHtml = sanitizeDescription(
              args.data.descriptionHtml as string
            );
          }
          return query(args);
        },
        upsert: ({ args, query }) => {
          if (args.create.descriptionHtml !== undefined) {
            args.create.descriptionHtml = sanitizeDescription(
              args.create.descriptionHtml
            );
          }
          if (args.update.descriptionHtml !== undefined) {
            args.update.descriptionHtml = sanitizeDescription(
              args.update.descriptionHtml as string
            );
          }
          return query(args);
        },
      },
    },
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma as unknown as PrismaClient;
}
