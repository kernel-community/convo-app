// storeGoogleToken
import { prisma } from "src/server/db";
import { google } from "googleapis";
import { pick } from "lodash";
import getCommunity from "src/server/utils/getCommunity";
import { getCredentials } from "src/server/utils/google/getCredentials";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = headers();
  const host = headersList.get("host");
  const origin = headersList.get("origin");
  if (!origin || !host) {
    throw new Error("why is origin or host not defined???");
  }
  const community = await getCommunity(host);
  // code that was received in the callback
  const body = await req.json();
  const { code }: { code: string } = pick(body, ["code"]);

  const {
    clientId,
    clientSecret,
    redirectUris,
    projectId,
    authUri,
    tokenUri,
    authProviderX509CertUrl,
    javascriptOrigins,
  } = await getCredentials({ origin, communityId: community.id });

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
      communityId: community?.id,
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

  return NextResponse.json({
    data: tokenUpdated,
  });
}
