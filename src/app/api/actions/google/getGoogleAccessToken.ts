// getGoogleAccessToken
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { getCredentials } from "./credentials";
import { pick } from "lodash";
import getCommunity from "src/server/utils/getCommunity";

export const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify",
];

export default async function getGoogleAccessToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headers = req.headers;
  const {
    origin,
    host,
  }: {
    origin?: string | undefined | string[];
    host?: string | undefined | string[];
  } = pick(headers, ["origin", "host"]);
  if (!origin || !host) {
    throw new Error("why is origin or host not defined???");
  }

  const community = await getCommunity(host);

  const { clientId, clientSecret, redirectUris } = await getCredentials({
    origin,
    communityId: community.id,
  });

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
