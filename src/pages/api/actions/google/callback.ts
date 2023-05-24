// storeGoogleToken
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import { google } from "googleapis";
import { pick } from "lodash";

export default async function callback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // code that was received in the callback
  const { code }: { code: string } = pick(req.body, ["code"]);

  // credentials from the db
  const credentials = await prisma.google.findFirst();
  if (!credentials) {
    throw new Error("add credentials to db");
  }
  const { clientId, clientSecret, redirectUris } = credentials;

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

  const tokenUpdated = await prisma.google.update({
    where: {
      id: credentials.id,
    },
    data: {
      accessToken: access_token?.toString(),
      refreshToken: refresh_token?.toString(),
      scope,
      tokenType: token_type?.toString(),
      expiryDate: expiry_date?.toString(),
    },
  });

  return res.status(200).json({
    data: "success",
  });
}
