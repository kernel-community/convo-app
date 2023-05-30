// getGoogleAccessToken
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { getCredentials } from "./credentials";
import { pick } from "lodash";

export const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify",
];

export default async function getGoogleAccessToken(
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

  const { clientId, clientSecret, redirectUris } = getCredentials(origin);
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
