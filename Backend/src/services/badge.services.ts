import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { CommunityEvent } from "../database/models/event.model";
import { Forum } from "../database/models/forum.model";
import { CommunityGroup } from "../database/models/group.model";
import { ForumMessage } from "../database/models/message.model";
import { User, type AvatarFrame } from "../database/models/user.model";

export type BadgeTone = "blue" | "red" | "yellow" | "green" | "purple";
export type BadgeCategory = "campus" | "forum-host" | "forum-member" | "first-message" | "event-maker" | "event-explorer" | "group-builder" | "group-member" | "connector" | "profile-ready" | "profile-love" | "comment-love" | "supporter";
export type Badge = {
  id: BadgeCategory; title: string; description: string; earnedAt: Date; tone: BadgeTone;
  level: number; maxLevel: number; progress: number; target: number; nextTarget?: number;
};

export const avatarFrameUnlocks: Record<AvatarFrame, { badge?: BadgeCategory; level?: number }> = {
  none: {},
  google: {},
  campus: {},
  gold: { badge: "event-maker", level: 1 },
  rainbow: { badge: "profile-ready", level: 1 },
  gemini: { badge: "first-message", level: 2 },
  orbit: { badge: "event-explorer", level: 2 },
  pixel: { badge: "forum-host", level: 2 },
  network: { badge: "group-builder", level: 2 },
  constellation: { badge: "connector", level: 1 },
  chrome: { badge: "profile-ready", level: 1 },
  android: { badge: "event-explorer", level: 1 },
  cloud: { badge: "forum-host", level: 1 },
  firebase: { badge: "first-message", level: 3 },
  maps: { badge: "event-maker", level: 2 },
  codejam: { badge: "group-builder", level: 1 },
  community: { badge: "forum-member", level: 2 },
  prism: { badge: "first-message", level: 4 },
  devfest: { badge: "event-maker", level: 3 },
  studio: { badge: "group-member", level: 2 },
  spark: { badge: "connector", level: 1 },
  material: {},
  heart: { badge: "profile-love", level: 1 },
  applause: { badge: "comment-love", level: 1 },
  comet: { badge: "profile-love", level: 3 },
  aura: { badge: "comment-love", level: 3 },
  mosaic: { badge: "supporter", level: 2 },
};

export const isAvatarFrameUnlocked = (frame: AvatarFrame, badges: Badge[]) => {
  const requirement = avatarFrameUnlocks[frame];
  return !requirement.badge || badges.some((badge) => badge.id === requirement.badge && badge.level >= (requirement.level ?? 1));
};

const LEVEL_TARGETS = [1, 3, 8, 18, 40];
const SOCIAL_LEVEL_TARGETS = [1, 5, 15, 35, 75];
const eventRepository = () => AppDataSource.getMongoRepository(CommunityEvent);
const forumRepository = () => AppDataSource.getMongoRepository(Forum);
const groupRepository = () => AppDataSource.getMongoRepository(CommunityGroup);
const messageRepository = () => AppDataSource.getMongoRepository(ForumMessage);
const userRepository = () => AppDataSource.getMongoRepository(User);
const includes = (ids: ObjectId[], userId: ObjectId) => ids.some((id) => id.equals(userId));
const byCreation = <T extends { createdAt: Date }>(items: T[]) => [...items].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

const levelBadge = <T extends { createdAt: Date }>(
  id: BadgeCategory, title: string, description: string, tone: BadgeTone, items: T[], targets = LEVEL_TARGETS,
): Badge | undefined => {
  const levelIndex = targets.reduce((current, target, index) => items.length >= target ? index : current, -1);
  if (levelIndex < 0) return undefined;
  const target = targets[levelIndex]!;
  return {
    id, title, description, tone, level: levelIndex + 1, maxLevel: targets.length, progress: items.length, target,
    nextTarget: targets[levelIndex + 1], earnedAt: byCreation(items)[Math.min(target - 1, items.length - 1)]!.createdAt,
  };
};

export const getUserBadges = async (user: User): Promise<Badge[]> => {
  const [events, forums, groups, messages, allMessages, referrals] = await Promise.all([
    eventRepository().find(), forumRepository().find(), groupRepository().find(),
    messageRepository().find({ where: { authorId: user._id } }), messageRepository().find(), userRepository().find({ where: { referredById: user._id } }),
  ]);
  const profileLikes = Array.from({ length: user.likedByIds?.length ?? user.likes ?? 0 }, () => ({ createdAt: user.updatedAt }));
  const commentLikes = messages.flatMap((message) => Array.from({ length: message.likedByIds?.length ?? 0 }, () => ({ createdAt: message.createdAt })));
  const reactionsGiven = allMessages.filter((message) => includes(message.likedByIds ?? [], user._id));
  const badges: Badge[] = [{ id: "campus", title: "Primeiro campus", description: "Entrou para uma universidade no Hub.", earnedAt: user.createdAt, tone: "blue", level: 1, maxLevel: 1, progress: 1, target: 1 }];
  const candidates = [
    levelBadge("forum-host", "Guardião das conversas", "Cria espaços para a comunidade trocar ideias.", "red", forums.filter((forum) => forum.createdBy.equals(user._id))),
    levelBadge("forum-member", "Voz da comunidade", "Participa de fóruns para aprender e colaborar.", "purple", forums.filter((forum) => !forum.createdBy.equals(user._id) && includes(forum.memberIds, user._id))),
    levelBadge("first-message", "Ideias em movimento", "Compartilha mensagens que movimentam a comunidade.", "green", messages),
    levelBadge("event-maker", "Criador de encontros", "Organiza experiências para sua comunidade.", "yellow", events.filter((event) => event.createdBy.equals(user._id))),
    levelBadge("event-explorer", "Explorador de eventos", "Marca presença e aproveita atividades do Hub.", "blue", events.filter((event) => !event.createdBy.equals(user._id) && includes(event.participantIds, user._id))),
    levelBadge("group-builder", "Construtor de rede", "Forma grupos de embaixadores para colaborar.", "green", groups.filter((group) => group.createdBy.equals(user._id))),
    levelBadge("group-member", "Em rede", "Aceita convites e constrói conexões no Hub.", "purple", groups.filter((group) => !group.createdBy.equals(user._id) && includes(group.memberIds, user._id))),
    levelBadge("connector", "Conector do Hub", "Traz novas pessoas para a comunidade.", "yellow", referrals),
    levelBadge("profile-love", "Perfil que inspira", "Recebe curtidas de pessoas que se conectam com seu perfil.", "red", profileLikes, SOCIAL_LEVEL_TARGETS),
    levelBadge("comment-love", "Conversas que marcam", "Recebe curtidas por contribui\u00e7\u00f5es nos f\u00f3runs.", "purple", commentLikes, SOCIAL_LEVEL_TARGETS),
    levelBadge("supporter", "Apoiador da comunidade", "Curte boas ideias e fortalece as conversas.", "green", reactionsGiven, SOCIAL_LEVEL_TARGETS),
  ];
  for (const badge of candidates) if (badge) badges.push(badge);
  if (user.bio && (user.githubUrl || user.linkedinUrl || user.instagramUrl)) badges.push({ id: "profile-ready", title: "Perfil em destaque", description: "Completou a bio e adicionou pelo menos um link.", earnedAt: user.updatedAt, tone: "red", level: 1, maxLevel: 1, progress: 1, target: 1 });
  return badges.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
};
