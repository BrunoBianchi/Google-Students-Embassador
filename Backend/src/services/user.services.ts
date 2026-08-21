import { ObjectId } from "mongodb";
import { createHash, randomBytes } from "node:crypto";
import { AppDataSource } from "../database/AppDataSource";
import { User } from "../database/models/user.model";
import { University } from "../database/models/university.model";
import type { RegistrationInput } from "../database/schemas/user.schema";
import type { LoginInput } from "../database/schemas/login.schema";
import type { ProfileInput } from "../database/schemas/profile.schema";
import { createOrFindUniversity, findUniversityById } from "./university.services";
import { createOrFindCampus, ensureUserCampusMembership, findCampusById } from "./campus.services";
import { getUserBadges, isAvatarFrameUnlocked } from "./badge.services";
import type { EmailPreferences } from "../database/models/user.model";
import { revokeUserSessions } from "./session.services";
import { groupNumberForInviteCode } from "../config/ambassador-group-codes";
import type { GoogleIdentity } from "./google-auth.services";


const userRepository = () => AppDataSource.getMongoRepository(User);
const universityRepository = () => AppDataSource.getMongoRepository(University);
const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newInviteCode = () => Array.from({ length: 8 }, () => inviteAlphabet[Math.floor(Math.random() * inviteAlphabet.length)]).join("");
const newGroupCode = (groupNumber: number) => `G${String(groupNumber).padStart(2, "0")}-${Array.from({ length: 6 }, () => inviteAlphabet[Math.floor(Math.random() * inviteAlphabet.length)]).join("")}`;
const includesUser = (ids: ObjectId[], userId: ObjectId) => ids.some((id) => id.equals(userId));
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const preferences = (user: User): EmailPreferences => ({ eventUpdates: user.emailPreferences?.eventUpdates !== false, forumUpdates: user.emailPreferences?.forumUpdates !== false, productUpdates: user.emailPreferences?.productUpdates !== false });
const isVerifiedUser = (user: Pick<User, "emailVerifiedAt">) => Boolean(user.emailVerifiedAt);
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const createGroupCode = async (groupNumber: number) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = newGroupCode(groupNumber);
    if (!(await userRepository().findOneBy({ groupCode: code }))) return code;
  }
  throw new Error("Could not create group code");
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
  await ensure({ googleSubject: 1 }, { unique: true, sparse: true, name: "user_google_subject_unique" });
  await ensure({ inviteCode: 1 }, { unique: true, sparse: true, name: "user_invite_code_unique" });
  await ensure(
    { groupCode: 1 },
    { unique: true, partialFilterExpression: { groupNumber: { $type: "number" } }, name: "user_group_code_unique" },
  );
  await ensure({ userType: 1, state: 1, city: 1 }, { name: "ambassador_directory_filters" });
  await ensure({ emailVerificationTokenHash: 1 }, { sparse: true, name: "email_verification_token" });
  await ensure({ passwordResetTokenHash: 1 }, { sparse: true, name: "password_reset_token" });
  await ensure({ emailPreferenceToken: 1 }, { unique: true, sparse: true, name: "email_preference_token" });
};

export const createUser = async (registration: RegistrationInput): Promise<User> => {
  if (await findUseByEmail(registration.email)) throw new Error("User with this email already exists!");

  const invitedGroupNumber = groupNumberForInviteCode(registration.groupInviteCode);
  if (registration.groupInviteCode && !invitedGroupNumber) throw new Error("Invalid group invite code");
  if (invitedGroupNumber && registration.groupNumber && invitedGroupNumber !== registration.groupNumber) {
    throw new Error("Group invite code mismatch");
  }
  const assignedGroupNumber = invitedGroupNumber ?? registration.groupNumber;

  const university = registration.universityId
    ? await findUniversityById(registration.universityId)
    : await createOrFindUniversity(registration.newUniversityName!);

  if (!university) throw new Error("University not found");

  // Ensure matching Campus entity is ready
  await createOrFindCampus(university.name).catch(() => undefined);

  const inviter = registration.referralCode ? await userRepository().findOneBy({ inviteCode: registration.referralCode }) : null;
  const { universityId: _universityId, newUniversityName: _newUniversityName, referralCode: _referralCode, termsAccepted: _termsAccepted, emailUpdates, groupNumber: _groupNumber, groupInviteCode: _groupInviteCode, ...userData } = registration;
  const entity = userRepository().create({
    ...userData,
    universityId: university._id,
    groupNumber: assignedGroupNumber,
    groupCode: assignedGroupNumber ? await createGroupCode(assignedGroupNumber) : undefined,
    inviteCode: await createInviteCode(),
    referredById: inviter?._id,
    emailPreferenceToken: newToken(),
    termsAcceptedAt: new Date(),
    privacyAcceptedAt: new Date(),
    emailPreferences: { eventUpdates: emailUpdates, forumUpdates: emailUpdates, productUpdates: emailUpdates },
  });
  return await userRepository().save(entity);
};

const activateCampusMembership = async (user: User) => {
  if (!user.universityId) return;
  const university = await findUniversityById(user.universityId.toHexString());
  if (!university) return;
  const campus = await createOrFindCampus(university.name).catch(() => null);
  if (!campus) return;
  await ensureUserCampusMembership(
    user,
    campus,
    user.userType === "ambassador" ? "AMBASSADOR" : "STUDENT",
  ).catch(() => undefined);
};

export const authenticateGoogleUser = async (identity: GoogleIdentity): Promise<User | null> => {
  const bySubject = await userRepository().findOneBy({ googleSubject: identity.subject });
  if (bySubject) return bySubject;

  const user = await findUserByEmail(identity.email);
  if (!user) return null;
  if (user.googleSubject && user.googleSubject !== identity.subject) throw new Error("Google account conflict");

  user.googleSubject = identity.subject;
  user.authProviders = Array.from(new Set([...(user.authProviders ?? ["password"]), "google"]));
  user.emailVerifiedAt ??= new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  const saved = await userRepository().save(user);
  await activateCampusMembership(saved);
  return saved;
};

export const createGoogleUser = async (registration: RegistrationInput, identity: GoogleIdentity): Promise<User> => {
  if (registration.email !== identity.email) throw new Error("Invalid Google credential");
  const existing = await authenticateGoogleUser(identity);
  if (existing) return existing;

  const user = await createUser(registration);
  user.googleSubject = identity.subject;
  user.authProviders = ["google"];
  user.emailVerifiedAt = new Date();
  const saved = await userRepository().save(user);
  await activateCampusMembership(saved);
  return saved;
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

export const restoreEmailVerification = async (user: User, state: Pick<User, "emailVerificationTokenHash" | "emailVerificationExpiresAt">) => {
  user.emailVerificationTokenHash = state.emailVerificationTokenHash;
  user.emailVerificationExpiresAt = state.emailVerificationExpiresAt;
  return await userRepository().save(user);
};

export const verifyEmail = async (token: string) => {
  const user = await userRepository().findOneBy({ emailVerificationTokenHash: tokenHash(token) });
  if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) throw new Error("Invalid or expired verification token");
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  const saved = await userRepository().save(user);

  // Automatically activate Campus membership for the verified user
  await activateCampusMembership(saved);

  return saved;
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

export const restorePasswordReset = async (user: User, state: Pick<User, "passwordResetTokenHash" | "passwordResetExpiresAt">) => {
  user.passwordResetTokenHash = state.passwordResetTokenHash;
  user.passwordResetExpiresAt = state.passwordResetExpiresAt;
  return await userRepository().save(user);
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
  if (profile.groupNumber && user.groupCode) {
    throw new Error("O seu grupo já foi definido anteriormente e não pode ser alterado.");
  }
  if (user.userType === "student" && profile.groupNumber) {
    throw new Error("Apenas embaixadores podem escolher um grupo.");
  }
  const { groupNumber, ...profileData } = profile;
  Object.assign(user, profileData);
  if (groupNumber) {
    user.groupNumber = groupNumber;
    user.groupCode = await createGroupCode(groupNumber);
  }
  return await userRepository().save(user);
};

import { getRegionByState, getStatesForRegionSlug } from "./region.services";
import { Campus } from "../database/models/campus.model";

const campusRepository = () => AppDataSource.getMongoRepository(Campus);

export type ListAmbassadorsOptions = {
  campus?: string;
  region?: string;
  state?: string;
  city?: string;
  search?: string;
  course?: string;
  page?: number;
  limit?: number;
};

export const listAmbassadors = async (
  optionsOrViewer?: ListAmbassadorsOptions | ObjectId | null,
  maybeViewerId?: ObjectId | null,
) => {
  const options: ListAmbassadorsOptions = (optionsOrViewer && typeof optionsOrViewer === "object" && !(optionsOrViewer instanceof ObjectId))
    ? optionsOrViewer
    : {};
  const viewerId = optionsOrViewer instanceof ObjectId ? optionsOrViewer : maybeViewerId;

  const ambassadors = await userRepository().find({
    where: { userType: "ambassador" },
    order: { likes: "DESC", createdAt: "DESC" },
  });

  const verifiedAmbassadors = ambassadors.filter((amb) => {
    if (!isVerifiedUser(amb)) return false;
    if (amb.privacySettings?.isPublic === false) return false;
    return true;
  });

  const universityIds = verifiedAmbassadors.map((ambassador) => ambassador.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await universityRepository().findByIds(universityIds)
    : [];
  const universityMap = new Map(universities.map((u) => [u._id.toHexString(), u.name]));

  const campuses = await campusRepository().find({ where: { isActive: true } });
  const campusSlugMap = new Map<string, { slug: string; name: string }>();
  for (const c of campuses) {
    campusSlugMap.set(c._id.toHexString(), { slug: c.slug, name: c.name });
    campusSlugMap.set(c.name.toLowerCase(), { slug: c.slug, name: c.name });
  }

  let mapped = verifiedAmbassadors.map((ambassador) => {
    const likedByIds = ambassador.likedByIds ?? [];
    const universityName = universityMap.get(ambassador.universityId?.toHexString() ?? "") ?? "Universidade";
    const campusInfo = campusSlugMap.get(ambassador.universityId?.toHexString() ?? "") || campusSlugMap.get(universityName.toLowerCase());
    const region = ambassador.region || getRegionByState(ambassador.state);

    return {
      id: ambassador._id.toHexString(),
      name: ambassador.name,
      nickname: ambassador.nickname ?? "",
      avatarPath: ambassador.avatarPath,
      avatarFrame: ambassador.avatarFrame ?? "none",
      bio: ambassador.privacySettings?.showBio !== false ? (ambassador.bio ?? "") : "",
      state: ambassador.state ?? "",
      city: ambassador.city ?? "",
      region,
      course: ambassador.privacySettings?.showCourse !== false ? (ambassador.course ?? "") : "",
      universityName: ambassador.privacySettings?.showCampus !== false ? universityName : "Universidade",
      campusSlug: campusInfo?.slug ?? "",
      githubUrl: ambassador.privacySettings?.showSocialLinks !== false ? ambassador.githubUrl : undefined,
      linkedinUrl: ambassador.privacySettings?.showSocialLinks !== false ? ambassador.linkedinUrl : undefined,
      instagramUrl: ambassador.privacySettings?.showSocialLinks !== false ? ambassador.instagramUrl : undefined,
      likes: ambassador.likes ?? likedByIds.length,
      likedByMe: Boolean(viewerId && includesUser(likedByIds, viewerId)),
    };
  });

  // Apply filters
  if (options.campus) {
    const campusQuery = options.campus.trim().toLowerCase();
    mapped = mapped.filter((a) => a.campusSlug.toLowerCase() === campusQuery || a.universityName.toLowerCase().includes(campusQuery));
  }

  if (options.region && options.region !== "ALL") {
    const regionSlug = options.region.trim().toLowerCase();
    const states = getStatesForRegionSlug(regionSlug);
    if (states.length > 0) {
      mapped = mapped.filter((a) => states.includes(a.state.toUpperCase()) || a.region.toLowerCase() === regionSlug);
    } else {
      mapped = mapped.filter((a) => a.region.toLowerCase().includes(regionSlug));
    }
  }

  if (options.state && options.state !== "ALL") {
    const stateQuery = options.state.trim().toUpperCase();
    mapped = mapped.filter((a) => a.state.toUpperCase() === stateQuery);
  }

  if (options.city) {
    const cityQuery = options.city.trim().toLowerCase();
    mapped = mapped.filter((a) => a.city.toLowerCase().includes(cityQuery));
  }

  if (options.search) {
    const q = options.search.trim().toLowerCase();
    mapped = mapped.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.nickname.toLowerCase().includes(q) ||
      a.universityName.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q) ||
      a.bio.toLowerCase().includes(q)
    );
  }

  const page = Math.max(options.page ?? 1, 1);
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const skip = (page - 1) * limit;

  return {
    total: mapped.length,
    page,
    limit,
    ambassadors: mapped.slice(skip, skip + limit),
  };
};

export const getAmbassadorPublicProfile = async (identifier: string, viewerId?: ObjectId | null) => {
  const isObjId = ObjectId.isValid(identifier);
  let ambassador = isObjId
    ? await userRepository().findOneBy({ _id: new ObjectId(identifier) })
    : null;

  if (!ambassador) {
    ambassador = await userRepository().findOne({
      where: {
        nickname: { $regex: new RegExp(`^${escapeRegex(identifier.replace(/^@/, "").trim())}$`, "i") },
      } as never,
    });
  }

  if (!ambassador || !isVerifiedUser(ambassador)) {
    throw new Error("Ambassador not found");
  }

  const university = ambassador.universityId
    ? await universityRepository().findOneBy({ _id: ambassador.universityId })
    : null;

  const campus = university
    ? await campusRepository().findOne({
        where: {
          $or: [
            { name: { $regex: new RegExp(`^${escapeRegex(university.name)}$`, "i") } },
          ],
        } as never,
      })
    : null;

  const likedByIds = ambassador.likedByIds ?? [];
  const region = ambassador.region || getRegionByState(ambassador.state);

  return {
    id: ambassador._id.toHexString(),
    name: ambassador.name,
    nickname: ambassador.nickname ?? "",
    avatarPath: ambassador.avatarPath,
    avatarFrame: ambassador.avatarFrame ?? "none",
    bio: ambassador.bio ?? "",
    state: ambassador.state ?? "",
    city: ambassador.city ?? "",
    region,
    course: ambassador.course ?? "",
    universityName: university?.name ?? "Universidade",
    campusSlug: campus?.slug ?? "",
    campusName: campus?.name ?? university?.name ?? "",
    githubUrl: ambassador.githubUrl,
    linkedinUrl: ambassador.linkedinUrl,
    instagramUrl: ambassador.instagramUrl,
    likes: ambassador.likes ?? likedByIds.length,
    likedByMe: Boolean(viewerId && includesUser(likedByIds, viewerId)),
    userType: ambassador.userType,
    joinedAt: ambassador.createdAt.toISOString(),
  };
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
