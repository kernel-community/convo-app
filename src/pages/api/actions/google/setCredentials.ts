// getGoogleAccessToken
/**
 *
 * requires admin_key in the header
 * admin_key is verified with the one in .env
 * this api deletes the Google table (this table is supposed to have one row only)
 * and uses the credentials passed in the body of this request to create a new row
 *
 * token generation would be required right after this (/admin/google)
 *
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import { pick } from "lodash";

export default async function setCredentials(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headersList = req.headers;
  const { admin_key }: { admin_key: string | string[] | undefined } = pick(
    headersList,
    ["admin_key"]
  );
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      data: false,
      message: "unauthorized",
    });
  }

  const {
    clientId,
    projectId,
    authUri,
    tokenUri,
    authProviderX509CertUrl,
    clientSecret,
    redirectUris,
    javascriptOrigins,
  }: {
    clientId: string;
    projectId: string;
    authUri: string;
    tokenUri: string;
    authProviderX509CertUrl: string;
    clientSecret: string;
    redirectUris: string[];
    javascriptOrigins: string[];
  } = pick(req.body, [
    "clientId",
    "projectId",
    "authUri",
    "tokenUri",
    "authProviderX509CertUrl",
    "clientSecret",
    "redirectUris",
    "javascriptOrigins",
  ]);

  await prisma.google.deleteMany();
  await prisma.google.create({
    data: {
      clientId,
      projectId,
      authUri,
      tokenUri,
      authProviderX509CertUrl,
      clientSecret,
      redirectUris,
      javascriptOrigins,
    },
  });
  return res.status(200).json({
    data: "success",
  });
}
