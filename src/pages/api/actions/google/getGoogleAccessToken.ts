// getGoogleAccessToken
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "src/server/db";
import { google } from "googleapis";

export const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify",
];

export default async function getGoogleAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  return res.status(200).json({
    data: authUrl,
  });
}
