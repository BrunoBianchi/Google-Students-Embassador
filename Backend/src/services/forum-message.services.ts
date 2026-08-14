import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { Forum, type ForumMemberAccess, type ForumRole } from "../database/models/forum.model";
import { ForumMessage } from "../database/models/message.model";
import { User } from "../database/models/user.model";
import { AUTO_MODERATOR_ID, AUTO_MODERATOR_ID_STRING, AUTO_MODERATOR_NAME, AUTO_MODERATOR_NICKNAME, DELETED_BY_AUTOMOD, attachAutoModerator, isAutoModeratorId } from "./forum-moderation.constants";

const forumRepository = () => AppDataSource.getMongoRepository(Forum);
const messageRepository = () => AppDataSource.getMongoRepository(ForumMessage);
const userRepository = () => AppDataSource.getMongoRepository(User);
const asId = (value: string) => ObjectId.isValid(value) ? new ObjectId(value) : null;
const includesUser = (ids: ObjectId[] = [], userId: ObjectId) => ids.some((id) => id.equals(userId));
const recentMessages = new Map<string, number>();

export const getForum = async (forumId: string) => {
  const id = asId(forumId);
  const forum = id ? await forumRepository().findOneBy({ _id: id }) : null;
  if (forum && attachAutoModerator(forum)) return await forumRepository().save(forum);
  return forum;
};

export const getForumMemberAccess = (forum: Forum, userId: ObjectId): ForumMemberAccess | { role: "owner" } | null => {
  if (forum.createdBy.equals(userId)) return { role: "owner" };
  const access = forum.memberAccess?.[userId.toHexString()];
  if (access?.bannedAt || !includesUser(forum.memberIds, userId)) return null;
  return access ?? { role: "member" };
};

export const getForumRole = (forum: Forum, userId: ObjectId): ForumRole | null => getForumMemberAccess(forum, userId)?.role ?? null;
const canModerate = (role: ForumRole | null) => role === "owner" || role === "admin" || role === "moderator";

export const canAccessForum = async (forumId: string, userId: ObjectId) => {
  const forum = await getForum(forumId);
  return Boolean(forum && getForumMemberAccess(forum, userId));
};

const requireForumMember = async (forumId: string, userId: ObjectId) => {
  const forum = await getForum(forumId);
  const access = forum ? getForumMemberAccess(forum, userId) : null;
  if (!forum) throw new Error("Resource not found");
  if (!access) throw new Error("Forum access denied");
  return { forum, access };
};

const messageView = (message: ForumMessage, author: User | undefined, viewerId: ObjectId) => ({
  id: message._id.toHexString(), content: message.content, createdAt: message.createdAt, parentMessageId: message.parentMessageId?.toHexString(),
  isDeleted: Boolean(message.deletedAt),
  likes: message.likedByIds?.length ?? 0, likedByMe: includesUser(message.likedByIds, viewerId),
  mentionedUserIds: (message.mentionedUserIds ?? []).map((id) => id.toHexString()),
  author: { id: message.authorId.toHexString(), name: author?.name ?? "Membro", nickname: author?.nickname, avatarPath: author?.avatarPath, avatarFrame: author?.avatarFrame ?? "none" },
});

const getForumUsers = async (forum: Forum, includeBanned = false) => {
  const bannedIds = includeBanned
    ? Object.entries(forum.memberAccess ?? {}).filter(([, access]) => access.bannedAt).map(([id]) => asId(id)).filter((id): id is ObjectId => Boolean(id))
    : [];
  const ids = [...forum.memberIds.filter((id) => !isAutoModeratorId(id)), forum.createdBy, ...bannedIds];
  const uniqueIds = [...new Map(ids.map((id) => [id.toHexString(), id])).values()];
  return await userRepository().findBy({ _id: { $in: uniqueIds } as never });
};

export const listForumMembers = async (forumId: string, viewerId: ObjectId) => {
  const { forum } = await requireForumMember(forumId, viewerId);
  const users = await getForumUsers(forum, getForumRole(forum, viewerId) === "owner");
  const members = users.map((user) => {
    const access = getForumMemberAccess(forum, user._id);
    const storedAccess = forum.memberAccess?.[user._id.toHexString()];
    return { id: user._id.toHexString(), name: user.name, nickname: user.nickname, avatarPath: user.avatarPath, avatarFrame: user.avatarFrame ?? "none", role: access?.role ?? storedAccess?.role ?? "member", mutedUntil: access && "mutedUntil" in access ? access.mutedUntil : undefined, readOnly: access && "readOnly" in access ? Boolean(access.readOnly) : false, banned: Boolean(storedAccess?.bannedAt), isBot: false };
  });
  return forum.memberAccess?.[AUTO_MODERATOR_ID_STRING]
    ? [{ id: AUTO_MODERATOR_ID.toHexString(), name: AUTO_MODERATOR_NAME, nickname: AUTO_MODERATOR_NICKNAME, avatarFrame: "google" as const, role: "moderator" as const, readOnly: true, banned: false, isBot: true }, ...members]
    : members;
};

export const listForumMessages = async (forumId: string, viewerId: ObjectId) => {
  const { forum } = await requireForumMember(forumId, viewerId);
  const messages = await messageRepository().find({ where: { forumId: forum._id }, order: { createdAt: "ASC" }, take: 100 });
  const authorIds = [...new Map(messages.map((message) => [message.authorId.toHexString(), message.authorId])).values()];
  const authors = new Map((await userRepository().findBy({ _id: { $in: authorIds } as never })).map((user) => [user._id.toHexString(), user]));
  return messages.map((message) => messageView(message, authors.get(message.authorId.toHexString()), viewerId));
};

const mentionIds = (content: string, members: User[]) => members
  .filter((member) => {
    const tag = (member.nickname || member.name).trim().split(/\s+/)[0]?.replace(/[^\p{L}\p{N}_-]/gu, "");
    return tag ? new RegExp(`(^|\\s)@${tag}(?=$|\\s|[.,!?])`, "iu").test(content) : false;
  })
  .map((member) => member._id);

export const createForumMessage = async (forumId: string, userId: ObjectId, content: string, parentMessageId?: string) => {
  const { forum, access } = await requireForumMember(forumId, userId);
  if (("readOnly" in access && access.readOnly) || ("mutedUntil" in access && access.mutedUntil && access.mutedUntil > new Date())) throw new Error("Forum is read only");
  const rateKey = `${forumId}:${userId.toHexString()}`;
  const now = Date.now();
  if (now - (recentMessages.get(rateKey) ?? 0) < 750) throw new Error("Forum rate limit");
  if (recentMessages.size > 10_000) recentMessages.clear();
  recentMessages.set(rateKey, now);
  const members = await getForumUsers(forum);
  const parentId = parentMessageId ? asId(parentMessageId) : null;
  if (parentMessageId && (!parentId || !(await messageRepository().findOneBy({ _id: parentId, forumId: forum._id })))) throw new Error("Resource not found");
  const message = await messageRepository().save(messageRepository().create({ forumId: forum._id, authorId: userId, content, parentMessageId: parentId ?? undefined, likedByIds: [], mentionedUserIds: mentionIds(content, members) }));
  const author = members.find((member) => member._id.equals(userId));
  return messageView(message, author, userId);
};

export const toggleForumMessageLike = async (forumId: string, messageId: string, userId: ObjectId) => {
  const { forum } = await requireForumMember(forumId, userId);
  const id = asId(messageId);
  const message = id ? await messageRepository().findOneBy({ _id: id, forumId: forum._id }) : null;
  if (!message) throw new Error("Resource not found");
  message.likedByIds = includesUser(message.likedByIds, userId) ? message.likedByIds.filter((id) => !id.equals(userId)) : [...message.likedByIds, userId];
  const author = await userRepository().findOneBy({ _id: message.authorId });
  return messageView(await messageRepository().save(message), author ?? undefined, userId);
};

const getAutomodTarget = async (forumId: string, targetId: string) => {
  const forum = await getForum(forumId);
  const targetObjectId = asId(targetId);
  if (!forum || !targetObjectId || isAutoModeratorId(targetObjectId) || targetObjectId.equals(forum.createdBy)) return null;
  const access = getForumMemberAccess(forum, targetObjectId);
  return access ? { forum, targetObjectId, access } : null;
};

export const redactForumMessageByAutomod = async (forumId: string, messageId: string) => {
  const forum = await getForum(forumId);
  const id = asId(messageId);
  const message = forum && id ? await messageRepository().findOneBy({ _id: id, forumId: forum._id }) : null;
  if (!message || message.deletedAt) return null;
  message.content = DELETED_BY_AUTOMOD;
  message.mentionedUserIds = [];
  message.deletedAt = new Date();
  message.deletedBy = "auto_moderator";
  return await messageRepository().save(message);
};

export const muteForumMemberByAutomod = async (forumId: string, targetId: string, minutes: number) => {
  const target = await getAutomodTarget(forumId, targetId);
  if (!target) return false;
  const key = target.targetObjectId.toHexString();
  target.forum.memberAccess = { ...(target.forum.memberAccess ?? {}), [key]: { ...(target.forum.memberAccess?.[key] ?? { role: target.access.role === "owner" ? "member" : target.access.role }), mutedUntil: new Date(Date.now() + Math.min(Math.max(minutes, 1), 10_080) * 60_000) } };
  await forumRepository().save(target.forum);
  return true;
};

export const removeForumMemberByAutomod = async (forumId: string, targetId: string) => {
  const target = await getAutomodTarget(forumId, targetId);
  if (!target) return false;
  target.forum.memberIds = target.forum.memberIds.filter((id) => !id.equals(target.targetObjectId));
  const nextAccess = { ...(target.forum.memberAccess ?? {}) };
  delete nextAccess[target.targetObjectId.toHexString()];
  target.forum.memberAccess = nextAccess;
  await forumRepository().save(target.forum);
  return true;
};

export const banForumMemberByAutomod = async (forumId: string, targetId: string) => {
  const target = await getAutomodTarget(forumId, targetId);
  if (!target) return false;
  const key = target.targetObjectId.toHexString();
  target.forum.memberIds = target.forum.memberIds.filter((id) => !id.equals(target.targetObjectId));
  target.forum.memberAccess = { ...(target.forum.memberAccess ?? {}), [key]: { ...(target.forum.memberAccess?.[key] ?? { role: target.access.role === "owner" ? "member" : target.access.role }), bannedAt: new Date() } };
  await forumRepository().save(target.forum);
  return true;
};

export const updateForumMember = async (forumId: string, actorId: ObjectId, targetId: string, update: { role?: "admin" | "moderator" | "member"; mutedForMinutes?: number; readOnly?: boolean; banned?: boolean }) => {
  const { forum, access: actorAccess } = await requireForumMember(forumId, actorId);
  const targetObjectId = asId(targetId);
  if (!targetObjectId || isAutoModeratorId(targetObjectId) || targetObjectId.equals(forum.createdBy) || targetObjectId.equals(actorId)) throw new Error("Forum moderation denied");
  const targetRole = getForumRole(forum, targetObjectId);
  if (!targetRole && !forum.memberAccess?.[targetId]?.bannedAt) throw new Error("Resource not found");
  const actorRole = actorAccess.role;
  if (!canModerate(actorRole) || (actorRole !== "owner" && targetRole !== "member")) throw new Error("Forum moderation denied");
  if (update.role && actorRole !== "owner") throw new Error("Forum moderation denied");
  const key = targetObjectId.toHexString();
  const current = forum.memberAccess?.[key] ?? { role: "member" as const };
  const next: ForumMemberAccess = { ...current, role: update.role ?? current.role };
  if (update.mutedForMinutes !== undefined) next.mutedUntil = update.mutedForMinutes ? new Date(Date.now() + update.mutedForMinutes * 60_000) : undefined;
  if (update.readOnly !== undefined) next.readOnly = update.readOnly;
  if (update.banned !== undefined) {
    next.bannedAt = update.banned ? new Date() : undefined;
    forum.memberIds = update.banned
      ? forum.memberIds.filter((id) => !id.equals(targetObjectId))
      : (includesUser(forum.memberIds, targetObjectId) ? forum.memberIds : [...forum.memberIds, targetObjectId]);
  }
  forum.memberAccess = { ...(forum.memberAccess ?? {}), [key]: next };
  return await forumRepository().save(forum);
};

export const removeForumMember = async (forumId: string, actorId: ObjectId, targetId: string) => {
  const { forum, access } = await requireForumMember(forumId, actorId);
  const targetObjectId = asId(targetId);
  const targetRole = targetObjectId ? getForumRole(forum, targetObjectId) : null;
  if (!targetObjectId || isAutoModeratorId(targetObjectId) || targetObjectId.equals(forum.createdBy) || targetObjectId.equals(actorId) || !targetRole || !canModerate(access.role) || (access.role !== "owner" && targetRole !== "member")) throw new Error("Forum moderation denied");
  forum.memberIds = forum.memberIds.filter((id) => !id.equals(targetObjectId));
  const nextAccess = { ...(forum.memberAccess ?? {}) };
  delete nextAccess[targetObjectId.toHexString()];
  forum.memberAccess = nextAccess;
  return await forumRepository().save(forum);
};

// The owner is the only actor allowed to permanently close a forum. Removing
// the forum document also makes all memberships inaccessible; its messages are
// deleted explicitly so no orphaned conversation data remains in MongoDB.
export const deleteForum = async (forumId: string, actorId: ObjectId) => {
  const forum = await getForum(forumId);
  if (!forum) throw new Error("Resource not found");
  if (!forum.createdBy.equals(actorId)) throw new Error("Only the forum owner can delete it");

  const memberIds = (forum.memberIds ?? [])
    .filter((memberId) => !isAutoModeratorId(memberId))
    .map((memberId) => memberId.toHexString());
  await messageRepository().delete({ forumId: forum._id } as never);
  await forumRepository().delete({ _id: forum._id } as never);
  return [...new Set(memberIds)];
};
