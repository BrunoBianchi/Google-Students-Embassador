import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { ServerSession } from "../database/models/session.model";

const sessionRepository = () => AppDataSource.getMongoRepository(ServerSession);
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const hasSameKeys = (existing: { key?: Record<string, number> }, keys: Record<string, number>) => {
  const current = existing.key ?? {};
  const currentEntries = Object.entries(current);
  return currentEntries.length === Object.keys(keys).length && currentEntries.every(([key, value]) => keys[key] === value);
};

export const ensureSessionIndexes = async () => {
  const repository = sessionRepository();
  const indexes = await repository.listCollectionIndexes().toArray();
  const ensure = async (keys: Record<string, number>, options: Record<string, unknown>) => {
    if (!indexes.some((index) => hasSameKeys(index, keys))) {
      await repository.createCollectionIndex(keys as never, options as never);
    }
  };

  await ensure({ tokenHash: 1 }, { unique: true, name: "session_token_hash_unique" });
  await ensure({ userId: 1, expiresAt: 1 }, { name: "session_user_expiry" });
  await ensure({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "session_expiry_ttl" });
};

export const createServerSession = async (userId: ObjectId) => {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await sessionRepository().save(sessionRepository().create({ tokenHash: hashToken(token), userId, expiresAt, lastSeenAt: new Date() }));
  return { token, expiresAt };
};

export const getServerSessionUserId = async (token: string): Promise<ObjectId | null> => {
  const session = await sessionRepository().findOneBy({ tokenHash: hashToken(token) });
  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
  if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    session.lastSeenAt = new Date();
    void sessionRepository().save(session).catch(() => undefined);
  }
  return session.userId;
};

export const revokeServerSession = async (token: string | undefined) => {
  if (!token) return;
  const session = await sessionRepository().findOneBy({ tokenHash: hashToken(token) });
  if (!session || session.revokedAt) return;
  session.revokedAt = new Date();
  await sessionRepository().save(session);
};

export const revokeUserSessions = async (userId: ObjectId) => {
  const sessions = await sessionRepository().findBy({ userId });
  const active = sessions.filter((session) => !session.revokedAt && session.expiresAt.getTime() > Date.now());
  if (!active.length) return;
  for (const session of active) session.revokedAt = new Date();
  await sessionRepository().save(active);
};
