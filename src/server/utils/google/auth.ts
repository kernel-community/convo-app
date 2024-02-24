import type { Auth } from "googleapis";
import { google } from "googleapis";
import { prisma } from "src/server/db";
export const getAuth = async () => {
  // @todo fetch auth for the current community

  const credentials = await prisma.google.findFirst();
  if (!credentials) {
    throw new Error("add credentials to db");
  }
  const {
    clientId,
    clientSecret,
    redirectUris,
    accessToken,
    refreshToken,
    scope,
    tokenType,
    expiryDate,
  } = credentials;

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUris[0]
  );

  if (!accessToken || !refreshToken || !scope || !tokenType || !expiryDate) {
    throw new Error("token not set properly");
  }

  const token = {
    access_token: accessToken,
    refresh_token: refreshToken,
    scope: scope,
    token_type: tokenType,
    expiry_date: Number(expiryDate),
  };

  oAuth2Client.setCredentials(token);

  // fetch and store refresh token
  const rtoken = (await (
    await oAuth2Client.getAccessToken()
  ).res?.data) as Auth.Credentials;
  if (!rtoken) return oAuth2Client;

  const { access_token, refresh_token, token_type, expiry_date } = rtoken;

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

  console.log(`
    google auth token updated ${JSON.stringify(tokenUpdated)}
  `);

  return oAuth2Client;
};
