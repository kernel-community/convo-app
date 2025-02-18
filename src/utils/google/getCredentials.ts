import { prisma } from "src/utils/db";
const credentials = {
  clientId: process.env.CLIENT_ID,
  projectId: "kernel-convo",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientSecret: process.env.CLIENT_SECRET,
};

export const getCredentials = async ({
  origin,
  communityId,
}: {
  origin: string;
  communityId: string;
}) => {
  const a = await prisma.google.findUniqueOrThrow({
    select: {
      redirectUris: true,
      javascriptOrigins: true,
    },
    where: {
      communityId,
    },
  });
  if (!a.javascriptOrigins || !a.redirectUris || !a) {
    throw new Error(
      "redirect uris or javascript origins not present in the database"
    );
  }
  const uri = a.redirectUris.find((uri) => uri.includes(origin));
  const removedSelectedUri = a.redirectUris.filter((_uri) => _uri !== uri);
  return {
    ...credentials,
    javascriptOrigins: a.javascriptOrigins,
    redirectUris: [uri, ...removedSelectedUri],
  };
};
