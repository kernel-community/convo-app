// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_DATABASE_URL: z.string().url(),
  // DIRECT_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  RESEND_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_DOMAIN: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.infer<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  DATABASE_DATABASE_URL: process.env.DATABASE_DATABASE_URL,
  // DIRECT_URL: process.env.DIRECT_URL,
  NODE_ENV: process.env.NODE_ENV,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_DOMAIN: process.env.CLERK_DOMAIN,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  NEXT_PUBLIC_PARTYKIT_SERVER_HOST: z.string(),
  NEXT_PUBLIC_KERNEL_SMOLBRAIN_API: z.string(),
  NEXT_PUBLIC_KERNEL_SMOLBRAIN_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PARTYKIT_SERVER_HOST:
    process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST,
  NEXT_PUBLIC_KERNEL_SMOLBRAIN_API:
    process.env.NEXT_PUBLIC_KERNEL_SMOLBRAIN_API,
  NEXT_PUBLIC_KERNEL_SMOLBRAIN_APP_NAME:
    process.env.NEXT_PUBLIC_KERNEL_SMOLBRAIN_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};
