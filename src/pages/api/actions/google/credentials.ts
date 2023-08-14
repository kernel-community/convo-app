const redirectUris = [
  "http://localhost:3000/admin/google/callback",
  "https://convo-app-gray.vercel.app/admin/google/callback",
  "https://convo.kernel.community/admin/google/callback",
  "https://convo.cafe/admin/google/callback",
];

const credentials = {
  clientId: process.env.CLIENT_ID,
  projectId: "kernel-convo",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientSecret: process.env.CLIENT_SECRET,
  javascriptOrigins: [
    "http://localhost:3000",
    "https://convo-app-gray.vercel.app",
    "https://convo.kernel.community",
    "https://convo.cafe",
  ],
};

export const getCredentials = (origin: string) => {
  const uri = redirectUris.find((uri) => uri.includes(origin));
  const removedSelectedUri = redirectUris.filter((_uri) => _uri !== uri);
  return {
    ...credentials,
    redirectUris: [uri, ...removedSelectedUri],
  };
};
