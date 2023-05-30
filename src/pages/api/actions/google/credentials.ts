export const credentials = {
  clientId: process.env.CLIENT_ID,
  projectId: "kernel-convo",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientSecret: process.env.CLIENT_SECRET,
  redirectUris: [
    "http://localhost:3000/admin/google/callback",
    "https://convo-app-gray.vercel.app/admin/google/callback",
    "https://convo-qnajubdsa-angelagilhotra.vercel.app/admin/google/callback",
    "https://convo.kernel.community/admin/google/callback",
    "https://convo-8p8oikxzw-angelagilhotra.vercel.app/admin/google/callback",
  ],
  javascriptOrigins: [
    "http://localhost:3000",
    "https://convo-app-gray.vercel.app",
    "https://convo-qnajubdsa-angelagilhotra.vercel.app",
    "https://convo.kernel.community",
    "https://convo-8p8oikxzw-angelagilhotra.vercel.app",
  ],
};
