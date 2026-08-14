import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";
import type { JWTDecryptOptions } from "jose";
import { createHash } from "node:crypto";

const JWT_SECRET = Bun.env.JWT_SECRET;
const JWT_ISSUER = Bun.env.JWT_ISSUER;
const JWT_AUDIENCE = Bun.env.JWT_AUDIENCE;

if (!JWT_SECRET || !JWT_ISSUER || !JWT_AUDIENCE) {
  throw new Error("JWT_SECRET, JWT_ISSUER e JWT_AUDIENCE devem ser definidos");
}

const secret = createHash("sha256").update(JWT_SECRET).digest();

export type JwtPayload = JWTPayload;

const decryptOptions: JWTDecryptOptions = {
  keyManagementAlgorithms: ["dir"],
  contentEncryptionAlgorithms: ["A256GCM"],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

export const jwtEncrypt = async (
  payload: JwtPayload,
  expiresIn: string | number = "7d",
): Promise<string> => {
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .encrypt(secret);
};

export const jwtDecryptToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jwtDecrypt(token, secret, decryptOptions);
    return payload;
  } catch {
    return null;
  }
};

export const jwtIsValid = async (token: string): Promise<boolean> => {
  return (await jwtDecryptToken(token)) !== null;
};
