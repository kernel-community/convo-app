// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["kernelconvo.s3.amazonaws.com", "kernelconvo.s3.us-east-2.amazonaws.com"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "convo.cafe",
          },
        ],
        destination: "https://www.convo.cafe/:path*",
        permanent: true,
      },
    ];
  },
};
export default config;
