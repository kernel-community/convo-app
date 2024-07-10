// getGoogleAccessToken
import { google } from "googleapis";
import getCommunity from "src/utils/getCommunity";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCredentials } from "src/utils/google/getCredentials";

const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify",
];

export async function POST() {
  const headersList = headers();
  const host = headersList.get("host");
  const origin = headersList.get("origin");
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

  return NextResponse.json({
    data: authUrl,
  });
}
