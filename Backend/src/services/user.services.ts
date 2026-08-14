import { ObjectId } from "mongodb";
import { createHash, randomBytes } from "node:crypto";
import { AppDataSource } from "../database/AppDataSource";
import { User } from "../database/models/user.model";
import { University } from "../database/models/university.model";
import type { RegistrationInput } from "../database/schemas/user.schema";
import type { LoginInput } from "../database/schemas/login.schema";
import type { ProfileInput } from "../database/schemas/profile.schema";
import { createOrFindUniversity, findUniversityById } from "./university.services";
import { getUserBadges, isAvatarFrameUnlocked } from "./badge.services";
import type { EmailPreferences } from "../database/models/user.model";
import { revokeUserSessions } from "./session.services";

const userRepository = () => AppDataSource.getMongoRepository(User);
const universityRepository = () => AppDataSource.getMongoRepository(University);
const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newInviteCode = () => Array.from({ length: 8 }, () => inviteAlphabet[Math.floor(Math.random() * inviteAlphabet.length)]).join("");
const includesUser = (ids: ObjectId[], userId: ObjectId) => ids.some((id) => id.equals(userId));
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const preferences = (user: User): EmailPreferences => ({ eventUpdates: user.emailPreferences?.eventUpdates !== false, forumUpdates: user.emailPreferences?.forumUpdates !== false, productUpdates: user.emailPreferences?.productUpdates !== false });
const isVerifiedUser = (user: Pick<User, "emailVerifiedAt">) => Boolean(user.emailVerifiedAt);

const hasSameKeys = (existing: { key?: Record<string, number> }, keys: Record<string, number>) => {
  const current = existing.key ?? {};
  const currentEntries = Object.entries(current);
  return currentEntries.length === Object.keys(keys).length && currentEntries.every(([key, value]) => keys[key] === value);
};

const createInviteCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = newInviteCode();
    if (!(await userRepository().findOneBy({ inviteCode: code }))) return code;
  }
  throw new Error("Could not create invite code");
};

export const ensureUserIndexes = async () => {
  const repository = userRepository();
  const indexes = await repository.listCollectionIndexes().toArray().catch((error: unknown) => {
    // MongoDB creates a collection on the first index write. A fresh database
    // has no namespace to list yet, which is expected during first deploy.
    if (typeof error === "object" && error !== null && "code" in error && error.code === 26) return [];
    throw error;
  });
  const ensure = async (keys: Record<string, number>, options: Record<string, unknown>) => {
    if (!indexes.some((index) => hasSameKeys(index, keys))) {
      await repository.createCollectionIndex(keys as never, options as never);
    }
  };

  await ensure({ email: 1 }, { unique: true });
  await ensure({ inviteCode: 1 }, { unique: true, sparse: true, name: "user_invite_code_unique" });
  await ensure({ userType: 1, state: 1, city: 1 }, { name: "ambassador_directory_filters" });
  await ensure({ emailVerificationTokenHash: 1 }, { sparse: true, name: "email_verification_token" });
  await ensure({ passwordResetTokenHash: 1 }, { sparse: true, name: "password_reset_token" });
  await ensure({ emailPreferenceToken: 1 }, { unique: true, sparse: true, name: "email_preference_token" });
};

export const createUser = async (registration: RegistrationInput): Promise<User> => {
  if (await findUseByEmail(registration.email)) throw new Error("User with this email already exists!");

  const university = registration.universityId
    ? await findUniversityById(registration.universityId)
    : await createOrFindUniversity(registration.newUniversityName!);

  if (!university) throw new Error("University not found");

  const inviter = registration.referralCode ? await userRepository().findOneBy({ inviteCode: registration.referralCode }) : null;
  const { universityId: _universityId, newUniversityName: _newUniversityName, referralCode: _referralCode, termsAccepted: _termsAccepted, emailUpdates, ...userData } = registration;
  const entity = userRepository().create({
    ...userData,
    universityId: university._id,
    inviteCode: await createInviteCode(),
    referredById: inviter?._id,
    emailPreferenceToken: newToken(),
    termsAcceptedAt: new Date(),
    privacyAcceptedAt: new Date(),
    emailPreferences: { eventUpdates: emailUpdates, forumUpdates: emailUpdates, productUpdates: emailUpdates },
  });
  return await userRepository().save(entity);
};

export const findUseByEmail = async (email: string): Promise<boolean> => {
  return Boolean(await findUserByEmail(email));
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await userRepository().findOneBy({ email });
};

export const findUserById = async (id: ObjectId): Promise<User | null> => {
  return await userRepository().findOneBy({ _id: id });
};

export const ensureUserInviteCode = async (user: User): Promise<User> => {
  if (user.inviteCode) return user;
  user.inviteCode = await createInviteCode();
  return await userRepository().save(user);
};

export const loginUser = async ({ email, password }: LoginInput): Promise<User> => {
  const user = await findUserByEmail(email);
  if (!user || !(await Bun.password.verify(password, user.password))) throw new Error("Invalid credentials");
  if (!user.emailVerifiedAt) throw new Error("Email not verified");
  return user;
};

export const issueEmailVerification = async (user: User) => {
  const token = newToken();
  user.emailVerificationTokenHash = tokenHash(token);
  user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await userRepository().save(user);
  return token;
};

export const verifyEmail = async (token: string) => {
  const user = await userRepository().findOneBy({ emailVerificationTokenHash: tokenHash(token) });
  if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) throw new Error("Invalid or expired verification token");
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  return await userRepository().save(user);
};

export const issuePasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = newToken();
  user.passwordResetTokenHash = tokenHash(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await userRepository().save(user);
  return { user, token };
};

export const resetPassword = async (token: string, password: string) => {
  const user = await userRepository().findOneBy({ passwordResetTokenHash: tokenHash(token) });
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now()) throw new Error("Invalid or expired reset token");
  user.password = await Bun.password.hash(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  const saved = await userRepository().save(user);
  await revokeUserSessions(saved._id);
  return saved;
};

export const unsubscribeEmailCategory = async (token: string, category: keyof EmailPreferences) => {
  const user = await userRepository().findOneBy({ emailPreferenceToken: token });
  if (!user) throw new Error("Invalid unsubscribe token");
  user.emailPreferences = { ...preferences(user), [category]: false };
  await userRepository().save(user);
  return user.emailPreferences;
};

export const getEmailPreferences = (user: User) => preferences(user);

export const updateUserProfile = async (id: ObjectId, profile: ProfileInput): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;
  if (profile.avatarFrame !== user.avatarFrame && !isAvatarFrameUnlocked(profile.avatarFrame, await getUserBadges(user))) {
    throw new Error("Essa moldura ainda está bloqueada. Conquiste o troféu indicado para desbloqueá-la.");
  }
  Object.assign(user, profile);
  return await userRepository().save(user);
};

export const listAmbassadors = async (viewerId?: ObjectId | null) => {
  const ambassadors = await userRepository().find({
    where: { userType: "ambassador" },
    order: { createdAt: "DESC" },
  });
  const verifiedAmbassadors = ambassadors.filter(isVerifiedUser);
  const universityIds = verifiedAmbassadors.map((ambassador) => ambassador.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await universityRepository().findByIds(universityIds)
    : [];
  const universityNames = new Map(universities.map((university) => [university._id.toHexString(), university.name]));

  return verifiedAmbassadors.map((ambassador) => {
    const likedByIds = ambassador.likedByIds ?? [];
    return {
      id: ambassador._id.toHexString(),
      name: ambassador.name,
      nickname: ambassador.nickname,
      avatarPath: ambassador.avatarPath,
      avatarFrame: ambassador.avatarFrame ?? "none",
      bio: ambassador.bio,
      state: ambassador.state ?? "",
      city: ambassador.city ?? "",
      universityName: universityNames.get(ambassador.universityId.toHexString()) ?? "Universidade não encontrada",
      likes: ambassador.likes ?? likedByIds.length,
      likedByMe: Boolean(viewerId && includesUser(likedByIds, viewerId)),
    };
  });
};

export const toggleProfileLike = async (profileId: string, viewerId: ObjectId) => {
  if (!ObjectId.isValid(profileId)) throw new Error("Resource not found");
  const profile = await userRepository().findOneBy({ _id: new ObjectId(profileId) });
  if (!profile || !isVerifiedUser(profile)) throw new Error("Resource not found");
  if (profile._id.equals(viewerId)) throw new Error("Cannot like own profile");

  const likedByIds = profile.likedByIds ?? [];
  const likedByMe = includesUser(likedByIds, viewerId);
  profile.likedByIds = likedByMe
    ? likedByIds.filter((userId) => !userId.equals(viewerId))
    : [...likedByIds, viewerId];
  profile.likes = Math.max(0, (profile.likes ?? likedByIds.length) + (likedByMe ? -1 : 1));
  await userRepository().save(profile);

  return { likes: profile.likes, likedByMe: !likedByMe };
};

export const toggleAmbassadorLike = (ambassadorId: string, viewerId: ObjectId) => toggleProfileLike(ambassadorId, viewerId);
