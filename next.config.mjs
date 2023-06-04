// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const ContentSecurityPolicy = `
  default-src 'self';
  connect-src 'vitals.vercel-insights.com';
`;

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  headers: async () => {
    return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
            }
          ],
        },
      ];
  },
};
export default config;
