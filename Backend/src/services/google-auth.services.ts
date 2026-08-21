import { createRemoteJWKSet, jwtVerify } from "jose";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdentity = {
  subject: string;
  email: string;
  name: string;
  picture?: string;
};

export const getGoogleOAuthClientId = () => Bun.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ?? "";

export const verifyGoogleCredential = async (credential: string): Promise<GoogleIdentity> => {
  const clientId = getGoogleOAuthClientId();
  if (!clientId) throw new Error("Google OAuth not configured");

  try {
    const { payload } = await jwtVerify(credential, googleJwks, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      algorithms: ["RS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      payload.email_verified !== true
    ) {
      throw new Error("Invalid Google credential");
    }

    return {
      subject: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : payload.email.split("@")[0]!,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid Google credential") throw error;
    throw new Error("Invalid Google credential");
  }
};
