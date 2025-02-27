import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;
if (!DYNAMIC_ENV_ID) {
  throw new Error("NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is not set");
}

// Initialize JWKS client
const jwksClient = new JwksClient({
  jwksUri: `https://app.dynamic.xyz/api/v0/sdk/${DYNAMIC_ENV_ID}/.well-known/jwks`,
  rateLimit: true,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

export async function verifyDynamicToken(token: string) {
  try {
    const signingKey = await jwksClient.getSigningKey();
    const publicKey = signingKey.getPublicKey();

    const decodedToken = jwt.verify(token, publicKey, {
      ignoreExpiration: false,
    }) as JwtPayload;

    if (decodedToken.scopes?.includes("requiresAdditionalAuth")) {
      throw new Error("Additional verification required");
    }

    return {
      id: decodedToken.sub,
      email: decodedToken.email as string,
      verified: true,
    };
  } catch (error) {
    console.error("[Auth] Error verifying token:", error);
    return { verified: false };
  }
}
