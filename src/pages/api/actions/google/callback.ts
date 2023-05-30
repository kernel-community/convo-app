// storeGoogleToken
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import { google } from "googleapis";
import { pick } from "lodash";
import { getCredentials } from "./credentials";

export default async function callback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headers = req.headers;
  const { origin }: { origin?: string | undefined | string[] } = pick(headers, [
    "origin",
  ]);
  if (!origin) {
    throw new Error("why is origin not defined???");
  }
  // code that was received in the callback
  const { code }: { code: string } = pick(req.body, ["code"]);
  const {
    clientId,
    clientSecret,
    redirectUris,
    projectId,
    authUri,
    tokenUri,
    authProviderX509CertUrl,
    javascriptOrigins,
  } = getCredentials(origin);

  if (
    !clientId ||
    !clientSecret ||
    !redirectUris ||
    !projectId ||
    !authUri ||
    !tokenUri ||
    !authProviderX509CertUrl ||
    !javascriptOrigins
  ) {
    throw new Error(
      "one of clientId, clientSecret, redirectUris, projectId, authUri, tokenUri, authProviderX509CertUrl, javascriptOrigins not defined"
    );
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUris[0]
  );

  // generate new token
  let tokenData;
  try {
    tokenData = await oAuth2Client.getToken(code);
  } catch (err) {
    throw err;
  }
  if (!tokenData) {
    throw new Error("token undefined");
  }

  const { tokens } = tokenData;
  const { access_token, refresh_token, scope, token_type, expiry_date } =
    tokens;

  if (
    !access_token ||
    !refresh_token ||
    !scope ||
    !token_type ||
    !expiry_date
  ) {
    throw new Error(
      "Error: one of access_token || refresh_token || scope || token_type || expiry_date undefined"
    );
  }

  const tokenUpdated = await prisma.google.upsert({
    where: {
      clientId,
    },
    create: {
      accessToken: access_token?.toString(),
      refreshToken: refresh_token?.toString(),
      scope,
      tokenType: token_type?.toString(),
      expiryDate: expiry_date?.toString(),
      clientId,
      clientSecret,
      redirectUris: redirectUris as string[],
      projectId,
      authUri,
      tokenUri,
      authProviderX509CertUrl,
      javascriptOrigins,
    },
    update: {
      accessToken: access_token?.toString(),
      refreshToken: refresh_token?.toString(),
      scope,
      tokenType: token_type?.toString(),
      expiryDate: expiry_date?.toString(),
      clientSecret,
      redirectUris: redirectUris as string[],
      projectId,
      authUri,
      tokenUri,
      authProviderX509CertUrl,
      javascriptOrigins,
    },
  });

  return res.status(200).json({
    data: tokenUpdated,
  });
}
