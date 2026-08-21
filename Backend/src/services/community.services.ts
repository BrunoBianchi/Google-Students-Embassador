import { ObjectId } from "mongodb";
import type { MongoRepository } from "typeorm";
import { AppDataSource } from "../database/AppDataSource";
import { CommunityEvent } from "../database/models/event.model";
import { Forum } from "../database/models/forum.model";
import { CommunityGroup } from "../database/models/group.model";
import { ForumMessage } from "../database/models/message.model";
import { University } from "../database/models/university.model";
import { Campus } from "../database/models/campus.model";
import { CampusMember } from "../database/models/campus-member.model";
import { User } from "../database/models/user.model";
import type { EventInput, EventUpdateInput, ForumInput, GroupInput } from "../database/schemas/community.schema";
import { getUserBadges } from "./badge.services";
import { getForum } from "./forum-message.services";
import { attachAutoModerator, isAutoModeratorId } from "./forum-moderation.constants";
import { notifyEventParticipants } from "./notification.services";
import { findCampusBySlug, getCampusMembership } from "./campus.services";

const eventRepository = () => AppDataSource.getMongoRepository(CommunityEvent);
const groupRepository = () => AppDataSource.getMongoRepository(CommunityGroup);
const forumRepository = () => AppDataSource.getMongoRepository(Forum);
const messageRepository = () => AppDataSource.getMongoRepository(ForumMessage);

const includesUser = (ids: ObjectId[], userId: ObjectId) => ids.some((id) => id.equals(userId));
const isOwner = (createdBy: ObjectId, userId: ObjectId) => createdBy.equals(userId);
const uniqueIds = (ids: ObjectId[]) => [...new Map(ids.map((id) => [id.toHexString(), id])).values()];
const isVerifiedUser = (user: Pick<User, "emailVerifiedAt">) => Boolean(user.emailVerifiedAt);
const resourceId = (id: string) => {
  if (!ObjectId.isValid(id)) throw new Error("Resource not found");
  return new ObjectId(id);
};

const eventView = (event: CommunityEvent, userId?: ObjectId | null) => ({
  id: event._id.toHexString(), title: event.title, description: event.description,
  startsAt: event.startsAt, endsAt: event.endsAt, location: event.location, createdAt: event.createdAt,
  city: event.city ?? "", state: event.state ?? "", coordinates: event.coordinates,
  visibility: event.visibility ?? "GLOBAL",
  campusId: event.campusId?.toHexString() ?? null,
  capacity: event.capacity ?? null, imageUrls: event.imageUrls ?? [], tags: event.tags ?? [],
  participantCount: (event.participantIds ?? []).filter((participantId) => !participantId.equals(event.createdBy)).length,
  availableSpots: event.capacity ? Math.max(0, event.capacity - (event.participantIds ?? []).filter((participantId) => !participantId.equals(event.createdBy)).length) : null,
  isParticipating: Boolean(userId && includesUser(event.participantIds ?? [], userId)),
  isOwner: Boolean(userId && isOwner(event.createdBy, userId)),
  isOrganizer: Boolean(userId && includesUser(event.organizerIds ?? [event.createdBy], userId)),
  organizerCount: (event.organizerIds ?? [event.createdBy]).length,
  forumId: event.forumId?.toHexString(),
  groupId: event.groupId?.toHexString(),
  groupIds: (event.groupIds ?? (event.groupId ? [event.groupId] : [])).map((id) => id.toHexString()),
});


const forumView = (forum: Forum, userId: ObjectId) => ({
  id: forum._id.toHexString(), title: forum.title, description: forum.description, createdAt: forum.createdAt,
  memberCount: forum.memberIds.filter((memberId) => !isAutoModeratorId(memberId)).length, isParticipating: includesUser(forum.memberIds, userId),
  isOwner: isOwner(forum.createdBy, userId),
});

const groupView = (group: CommunityGroup, userId: ObjectId) => ({
  id: group._id.toHexString(), name: group.name, description: group.description, createdAt: group.createdAt,
  memberCount: group.memberIds.length, isParticipating: includesUser(group.memberIds, userId),
  isOwner: isOwner(group.createdBy, userId),
});

export const listEvents = async (userId: ObjectId) =>
  (await eventRepository().find({ order: { startsAt: "ASC" } })).map((event) => eventView(event, userId));

export const listForums = async (userId: ObjectId) =>
  (await forumRepository().find({ order: { createdAt: "DESC" } }))
    .filter((forum) => isOwner(forum.createdBy, userId) || includesUser(forum.memberIds ?? [], userId))
    .map((forum) => forumView(forum, userId));

export const listGroups = async (userId: ObjectId) =>
  (await groupRepository().find({ order: { createdAt: "DESC" } })).map((group) => groupView(group, userId));

const requireEventManager = async (eventId: string, userId: ObjectId) => {
  const event = await eventRepository().findOneBy({ _id: resourceId(eventId) });
  if (!event) throw new Error("Resource not found");
  if (!includesUser(event.organizerIds ?? [event.createdBy], userId)) throw new Error("Event management denied");
  return event;
};

const syncEventForumMembers = async (event: CommunityEvent) => {
  if (!event.forumId) return;
  const forum = await forumRepository().findOneBy({ _id: event.forumId });
  if (!forum) return;
  const organizerIds = event.organizerIds ?? [event.createdBy];
  forum.memberIds = uniqueIds([...organizerIds, ...forum.memberIds.filter((id) => isAutoModeratorId(id))]);
  forum.memberAccess = Object.fromEntries(organizerIds.filter((id) => !id.equals(event.createdBy)).map((id) => [id.toHexString(), { role: "admin" as const }]));
  attachAutoModerator(forum);
  await forumRepository().save(forum);
};

export const createEventForum = async (eventId: string, userId: ObjectId) => {
  const event = await requireEventManager(eventId, userId);
  if (!event.forumId) {
    const organizerIds = event.organizerIds ?? [event.createdBy];
    const forum = forumRepository().create({ title: `Organização · ${event.title}`, description: `Espaço privado da equipe que organiza o evento “${event.title}”.`, createdBy: event.createdBy, memberIds: organizerIds, memberAccess: Object.fromEntries(organizerIds.filter((id) => !id.equals(event.createdBy)).map((id) => [id.toHexString(), { role: "admin" as const }])), isPrivate: true });
    attachAutoModerator(forum);
    event.forumId = (await forumRepository().save(forum))._id;
    await eventRepository().save(event);
  }
  return eventView(event, userId);
};

export const createEvent = async (input: EventInput, userId: ObjectId) => {
  const { organizerIds: requestedOrganizerIds, groupId, createForum, campusId: rawCampusId, ...eventInput } = input;
  const requestedIds = requestedOrganizerIds.map((id) => new ObjectId(id));
  const requestedUsers = requestedIds.length ? await AppDataSource.getMongoRepository(User).findByIds(requestedIds) : [];
  if (requestedUsers.length !== requestedIds.length || requestedUsers.some((user) => !isVerifiedUser(user))) throw new Error("Event organizer not found");

  let targetCampusId: ObjectId | undefined = undefined;
  if (eventInput.visibility === "CAMPUS") {
    if (!rawCampusId || !ObjectId.isValid(rawCampusId)) {
      throw new Error("Campus not found");
    }
    targetCampusId = new ObjectId(rawCampusId);
    // Enforce authorization: user must be an active AMBASSADOR or CAMPUS_ADMIN of targetCampusId
    const membership = await getCampusMembership(userId, targetCampusId);
    const user = await AppDataSource.getMongoRepository(User).findOneBy({ _id: userId });
    const isAssociatedAmbassador = user?.userType === "ambassador" && user.universityId?.equals(targetCampusId);
    const hasAmbassadorRole = membership && membership.status === "ACTIVE" && (membership.role === "AMBASSADOR" || membership.role === "CAMPUS_ADMIN");

    if (!hasAmbassadorRole && !isAssociatedAmbassador) {
      throw new Error("Event management denied");
    }
  }

  let groupMembers: ObjectId[] = [];
  if (groupId) {
    const group = await groupRepository().findOneBy({ _id: resourceId(groupId) });
    if (!group || !group.createdBy.equals(userId)) throw new Error("Group management denied");
    groupMembers = group.memberIds ?? [];
  }
  const organizerIds = uniqueIds([userId, ...requestedIds, ...groupMembers]);
  const selectedGroupId = groupId ? new ObjectId(groupId) : undefined;
  const event = eventRepository().create({
    ...eventInput,
    campusId: targetCampusId,
    createdBy: userId,
    participantIds: [userId],
    organizerIds,
    groupId: selectedGroupId,
    groupIds: selectedGroupId ? [selectedGroupId] : [],
    news: [],
  });
  const saved = await eventRepository().save(event);
  return createForum ? createEventForum(saved._id.toHexString(), userId) : eventView(saved, userId);
};


export const updateEvent = async (
  eventId: string,
  arg2: EventUpdateInput | ObjectId,
  arg3?: ObjectId | EventUpdateInput,
) => {
  let input: EventUpdateInput;
  let userId: ObjectId;

  if (arg2 instanceof ObjectId) {
    userId = arg2;
    input = arg3 as EventUpdateInput;
  } else {
    input = arg2 as EventUpdateInput;
    userId = arg3 as ObjectId;
  }

  const event = await requireEventManager(eventId, userId);
  Object.assign(event, input);
  return eventView(await eventRepository().save(event), userId);
};

export const deleteEvent = async (eventId: string, userId: ObjectId) => {
  const event = await eventRepository().findOneBy({ _id: resourceId(eventId) });
  if (!event) throw new Error("Resource not found");
  if (!event.createdBy.equals(userId)) throw new Error("Only the event owner can delete it");
  if (event.forumId) {
    await messageRepository().delete({ forumId: event.forumId } as never);
    await forumRepository().delete({ _id: event.forumId } as never);
  }
  await eventRepository().delete({ _id: event._id } as never);
};

export const cancelEvent = async (eventId: string, userId: ObjectId) => {
  return deleteEvent(eventId, userId);
};

export const getEvent = async (eventId: string, viewerId?: ObjectId | null) => {
  const details = await getEventDetails(eventId, viewerId);
  if (!details) throw new Error("Resource not found");
  return details;
};

export const participateInEvent = async (eventId: string, userId: ObjectId) => {
  return setEventParticipation(eventId, userId, true);
};

export const cancelParticipation = async (eventId: string, userId: ObjectId) => {
  return setEventParticipation(eventId, userId, false);
};

export const addEventOrganizer = async (eventId: string, organizerId: string, userId: ObjectId) => {
  const event = await requireEventManager(eventId, userId);
  const candidate = ObjectId.isValid(organizerId) ? await AppDataSource.getMongoRepository(User).findOneBy({ _id: new ObjectId(organizerId) }) : null;
  if (!candidate || !isVerifiedUser(candidate)) throw new Error("Event organizer not found");
  event.organizerIds = uniqueIds([...(event.organizerIds ?? [event.createdBy]), candidate._id]);
  const saved = await eventRepository().save(event);
  await syncEventForumMembers(saved);
  return eventView(saved, userId);
};

export const addEventOrganizerGroup = async (eventId: string, groupId: string, userId: ObjectId) => {
  const event = await requireEventManager(eventId, userId);
  const group = await groupRepository().findOneBy({ _id: resourceId(groupId) });
  if (!group || !group.createdBy.equals(userId)) throw new Error("Group management denied");
  event.organizerIds = uniqueIds([...(event.organizerIds ?? [event.createdBy]), ...(group.memberIds ?? [])]);
  event.groupIds = uniqueIds([...(event.groupIds ?? (event.groupId ? [event.groupId] : [])), group._id]);
  const saved = await eventRepository().save(event);
  await syncEventForumMembers(saved);
  return eventView(saved, userId);
};

export const removeEventOrganizer = async (eventId: string, organizerId: string, userId: ObjectId) => {
  const event = await requireEventManager(eventId, userId);
  if (event.createdBy.toHexString() === organizerId) throw new Error("Event owner cannot be removed");
  event.organizerIds = (event.organizerIds ?? []).filter((id) => id.toHexString() !== organizerId);
  const saved = await eventRepository().save(event);
  await syncEventForumMembers(saved);
  return eventView(saved, userId);
};

export const addEventNews = async (eventId: string, content: string, userId: ObjectId) => {
  const event = await requireEventManager(eventId, userId);
  event.news = [...(event.news ?? []), { id: new ObjectId().toHexString(), content, createdAt: new Date(), createdBy: userId }];
  const saved = await eventRepository().save(event);
  void notifyEventParticipants({ id: saved._id.toHexString(), title: saved.title, participantIds: saved.participantIds, createdBy: saved.createdBy }, userId, content);
  return eventView(saved, userId);
};

export const createForum = async (input: ForumInput, userId: ObjectId) => {
  const forum = forumRepository().create({ ...input, createdBy: userId, memberIds: [userId], memberAccess: {}, isPrivate: false });
  attachAutoModerator(forum);
  return forumView(await forumRepository().save(forum), userId);
};

export const updateForum = async (id: string, input: ForumInput, userId: ObjectId) => {
  const forum = await forumRepository().findOneBy({ _id: resourceId(id) });
  if (!forum) throw new Error("Resource not found");
  if (!forum.createdBy.equals(userId)) throw new Error("Resource management denied");
  Object.assign(forum, input);
  return forumView(await forumRepository().save(forum), userId);
};

export const createGroup = async (input: GroupInput, user: User) => {
  const group = groupRepository().create({ ...input, createdBy: user._id, universityId: user.universityId, memberIds: [user._id], pendingMemberIds: [] });
  return groupView(await groupRepository().save(group), user._id);
};

export const updateGroup = async (id: string, input: GroupInput, userId: ObjectId) => {
  const group = await groupRepository().findOneBy({ _id: resourceId(id) });
  if (!group) throw new Error("Resource not found");
  if (!group.createdBy.equals(userId)) throw new Error("Resource management denied");
  Object.assign(group, input);
  return groupView(await groupRepository().save(group), userId);
};

export const deleteGroup = async (id: string, userId: ObjectId) => {
  const group = await groupRepository().findOneBy({ _id: resourceId(id) });
  if (!group) throw new Error("Resource not found");
  if (!group.createdBy.equals(userId)) throw new Error("Only the group owner can delete it");
  const events = await eventRepository().find();
  const affected = events.filter((event) => (event.groupIds ?? (event.groupId ? [event.groupId] : [])).some((groupId) => groupId.equals(group._id)));
  for (const event of affected) {
    event.groupIds = (event.groupIds ?? []).filter((groupId) => !groupId.equals(group._id));
    if (event.groupId?.equals(group._id)) event.groupId = undefined;
  }
  if (affected.length) await eventRepository().save(affected);
  await groupRepository().delete({ _id: group._id } as never);
};

export const inviteGroupMember = async (groupId: string, targetUserId: string, userId: ObjectId) => {
  const group = await groupRepository().findOneBy({ _id: resourceId(groupId) });
  if (!group) throw new Error("Resource not found");
  if (!group.createdBy.equals(userId)) throw new Error("Resource management denied");
  const target = ObjectId.isValid(targetUserId) ? await AppDataSource.getMongoRepository(User).findOneBy({ _id: new ObjectId(targetUserId) }) : null;
  if (!target || !isVerifiedUser(target) || target.userType !== "ambassador") throw new Error("Group invitee not found");
  if (!includesUser(group.memberIds ?? [], target._id) && !includesUser(group.pendingMemberIds ?? [], target._id)) group.pendingMemberIds = [...(group.pendingMemberIds ?? []), target._id];
  return groupView(await groupRepository().save(group), userId);
};

export const respondToGroupInvitation = async (groupId: string, userId: ObjectId, accept: boolean) => {
  const group = await groupRepository().findOneBy({ _id: resourceId(groupId) });
  if (!group) throw new Error("Resource not found");
  if (!includesUser(group.pendingMemberIds ?? [], userId)) throw new Error("Group invitation not found");
  group.pendingMemberIds = (group.pendingMemberIds ?? []).filter((memberId) => !memberId.equals(userId));
  if (accept && !includesUser(group.memberIds ?? [], userId)) group.memberIds = [...(group.memberIds ?? []), userId];
  return groupView(await groupRepository().save(group), userId);
};

export const listGroupInvitations = async (userId: ObjectId) =>
  (await groupRepository().find({ order: { updatedAt: "DESC" } }))
    .filter((group) => includesUser(group.pendingMemberIds ?? [], userId))
    .map((group) => groupView(group, userId));

export const listPendingGroupMembers = async (groupId: string, userId: ObjectId) => {
  const group = await groupRepository().findOneBy({ _id: resourceId(groupId) });
  if (!group) throw new Error("Resource not found");
  if (!group.createdBy.equals(userId)) throw new Error("Resource management denied");
  const members = (group.pendingMemberIds ?? []).length
    ? await AppDataSource.getMongoRepository(User).findByIds(group.pendingMemberIds)
    : [];
  return members.filter(isVerifiedUser).map((member) => ({ id: member._id.toHexString(), name: member.name, nickname: member.nickname, avatarPath: member.avatarPath, avatarFrame: member.avatarFrame ?? "none" }));
};

const updateParticipation = async <T extends { _id: ObjectId; createdBy: ObjectId }>(
  repository: MongoRepository<T>, id: string, userId: ObjectId, field: "participantIds" | "memberIds", join: boolean,
) => {
  const resource = await repository.findOneBy({ _id: resourceId(id) } as never) as (T & Record<typeof field, ObjectId[]>) | null;
  if (!resource) throw new Error("Resource not found");
  const participants = resource[field] ?? [];
  resource[field] = join
    ? (includesUser(participants, userId) ? participants : [...participants, userId])
    : participants.filter((participant) => !participant.equals(userId));
  return await repository.save(resource);
};

export const setEventParticipation = async (id: string, userId: ObjectId, join: boolean) => {
  const event = await eventRepository().findOneBy({ _id: resourceId(id) });
  if (!event) throw new Error("Resource not found");
  const participants = event.participantIds ?? [];
  const isParticipating = includesUser(participants, userId);
  const attendeeCount = participants.filter((participantId) => !participantId.equals(event.createdBy)).length;
  if (join && !isParticipating && !userId.equals(event.createdBy) && event.capacity && attendeeCount >= event.capacity) throw new Error("Event is full");
  event.participantIds = join
    ? (isParticipating ? participants : [...participants, userId])
    : participants.filter((participantId) => !participantId.equals(userId));
  return eventView(await eventRepository().save(event), userId);
};

const publicEventParticipant = (user: User, universityName: string) => ({
  id: user._id.toHexString(),
  name: user.name,
  nickname: user.nickname,
  userType: user.userType,
  avatarPath: user.avatarPath,
  avatarFrame: user.avatarFrame ?? "none",
  state: user.state ?? "",
  city: user.city ?? "",
  universityName,
});

export const getEventDetails = async (id: string, viewerId?: ObjectId | null) => {
  const event = await eventRepository().findOneBy({ _id: resourceId(id) });
  if (!event) return null;
  const participantIds = (event.participantIds ?? []).filter((participantId) => !participantId.equals(event.createdBy));
  const organizerIds = event.organizerIds ?? [event.createdBy];
  const relatedUserIds = uniqueIds([...participantIds, ...organizerIds, ...(event.news ?? []).map((item) => item.createdBy)]);
  const users = relatedUserIds.length
    ? await AppDataSource.getMongoRepository(User).findByIds(relatedUserIds)
    : [];
  const universityIds = users.map((user) => user.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await AppDataSource.getMongoRepository(University).findByIds(universityIds)
    : [];
  const universityNames = new Map(universities.map((university) => [university._id.toHexString(), university.name]));
  const userViews = users.filter(isVerifiedUser).map((user) => publicEventParticipant(user, universityNames.get(user.universityId.toHexString()) ?? "Universidade não encontrada"));
  const participantsById = new Map(userViews.map((participant) => [participant.id, participant]));
  const participants = participantIds.flatMap((participantId) => {
    const participant = participantsById.get(participantId.toHexString());
    return participant ? [participant] : [];
  });
  const organizer = participantsById.get(event.createdBy.toHexString());
  const organizers = organizerIds.flatMap((organizerId) => {
    const organizer = participantsById.get(organizerId.toHexString());
    return organizer ? [organizer] : [];
  });

  return {
    event: eventView(event, viewerId),
    organizer,
    organizers,
    participants,
    ambassadorParticipants: organizers.filter((participant) => participant.userType === "ambassador"),
    news: (event.news ?? []).map((item) => ({ id: item.id, content: item.content, createdAt: item.createdAt, author: participantsById.get(item.createdBy.toHexString()) })),
  };
};

export const listEventDirectory = async (viewerId?: ObjectId | null) => {
  const events = await eventRepository().find({ order: { startsAt: "ASC" } });
  const organizerIds = [...new Map(events.map((event) => [event.createdBy.toHexString(), event.createdBy])).values()];
  const organizers = organizerIds.length
    ? await AppDataSource.getMongoRepository(User).findByIds(organizerIds)
    : [];
  const universityIds = organizers.map((organizer) => organizer.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await AppDataSource.getMongoRepository(University).findByIds(universityIds)
    : [];
  const universityNames = new Map(universities.map((university) => [university._id.toHexString(), university.name]));
  const organizerViews = new Map(organizers.filter(isVerifiedUser).map((organizer) => [organizer._id.toHexString(), publicEventParticipant(organizer, universityNames.get(organizer.universityId.toHexString()) ?? "Universidade não encontrada")]));
  return events.map((event) => ({
    ...eventView(event, viewerId),
    organizer: organizerViews.get(event.createdBy.toHexString()),
  }));
};

export const listForumDirectory = async (viewerId?: ObjectId | null) => {
  const forums = await forumRepository().find({ order: { createdAt: "DESC" } });
  const organizerIds = [...new Map(forums.map((forum) => [forum.createdBy.toHexString(), forum.createdBy])).values()];
  const organizers = organizerIds.length
    ? await AppDataSource.getMongoRepository(User).findByIds(organizerIds)
    : [];
  const universityIds = organizers.map((organizer) => organizer.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await AppDataSource.getMongoRepository(University).findByIds(universityIds)
    : [];
  const universityNames = new Map(universities.map((university) => [university._id.toHexString(), university.name]));
  const organizerViews = new Map(organizers.filter(isVerifiedUser).map((organizer) => [organizer._id.toHexString(), publicEventParticipant(organizer, universityNames.get(organizer.universityId.toHexString()) ?? "Universidade não encontrada")]));
  return forums.filter((forum) => !forum.isPrivate || Boolean(viewerId && includesUser(forum.memberIds ?? [], viewerId))).map((forum) => ({
    id: forum._id.toHexString(),
    title: forum.title,
    description: forum.description,
    createdAt: forum.createdAt,
    memberCount: (forum.memberIds ?? []).filter((memberId) => !isAutoModeratorId(memberId)).length,
    isParticipating: Boolean(viewerId && includesUser(forum.memberIds ?? [], viewerId)),
    organizer: organizerViews.get(forum.createdBy.toHexString()),
  }));
};

export const getForumSummary = async (id: string, userId: ObjectId) => {
  const forum = await getForum(id);
  return forum ? forumView(forum, userId) : null;
};

export const setForumParticipation = async (id: string, userId: ObjectId, join: boolean) => {
  const forum = await getForum(id);
  if (!forum) throw new Error("Resource not found");
  if (!join && forum.createdBy.equals(userId)) throw new Error("O dono não pode sair do próprio fórum. Exclua o fórum caso queira encerrá-lo.");
  if (join && forum.isPrivate && !includesUser(forum.memberIds ?? [], userId)) throw new Error("Forum access denied");
  const key = userId.toHexString();
  if (join && forum.memberAccess?.[key]?.bannedAt) throw new Error("Forum access denied");
  forum.memberIds = join
    ? (includesUser(forum.memberIds, userId) ? forum.memberIds : [...forum.memberIds, userId])
    : forum.memberIds.filter((memberId) => !memberId.equals(userId));
  if (join && !forum.memberAccess?.[key]) forum.memberAccess = { ...(forum.memberAccess ?? {}), [key]: { role: "member" } };
  return forumView(await forumRepository().save(forum), userId);
};

export const setGroupParticipation = async (id: string, userId: ObjectId, join: boolean) =>
  groupView(await updateParticipation(groupRepository(), id, userId, "memberIds", join), userId);

export const getDashboard = async (user: User) => {
  const [events, forums, groups, university] = await Promise.all([
    listEvents(user._id), listForums(user._id), user.userType === "ambassador" ? listGroups(user._id) : Promise.resolve([]),
    AppDataSource.getMongoRepository(University).findOneBy({ _id: user.universityId }),
  ]);
  const currentTime = new Date().getTime();
  const upcomingEvents = events.filter((event) => event.isParticipating && new Date(event.startsAt).getTime() >= currentTime).slice(0, 3);
  const activeForums = forums.filter((forum) => forum.isParticipating || forum.isOwner).slice(0, 3);

  return {
    profile: {
      id: user._id.toHexString(), name: user.name, nickname: user.nickname, email: user.email,
      userType: user.userType, avatarPath: user.avatarPath, bio: user.bio, githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl, instagramUrl: user.instagramUrl, phone: user.phone, avatarFrame: user.avatarFrame ?? "none",
      state: user.state ?? "", city: user.city ?? "",
      universityName: university?.name ?? "Universidade nao encontrada",
      inviteCode: user.inviteCode,
    },
    stats: {
      eventsCreated: events.filter((event) => event.isOwner).length,
      eventsParticipating: events.filter((event) => event.isParticipating).length,
      forumsCreated: forums.filter((forum) => forum.isOwner).length,
      forumsParticipating: forums.filter((forum) => forum.isParticipating).length,
      groupsCreated: groups.filter((group) => group.isOwner).length,
      groupsParticipating: groups.filter((group) => group.isParticipating).length,
    },
    upcomingEvents, activeForums, groups,
    badges: await getUserBadges(user),
  };
};

export const getPublicProfile = async (id: string, viewerId?: ObjectId | null) => {
  if (!ObjectId.isValid(id)) return null;
  const user = await AppDataSource.getMongoRepository(User).findOneBy({ _id: new ObjectId(id) });
  if (!user || !isVerifiedUser(user)) return null;
  const [university, events, forums, groups, badges] = await Promise.all([
    AppDataSource.getMongoRepository(University).findOneBy({ _id: user.universityId }),
    eventRepository().find(), forumRepository().find(), groupRepository().find(), getUserBadges(user),
  ]);
  return {
    profile: {
      id: user._id.toHexString(), name: user.name, nickname: user.nickname, userType: user.userType,
      avatarPath: user.avatarPath, avatarFrame: user.avatarFrame ?? "none", bio: user.bio,
      githubUrl: user.githubUrl, linkedinUrl: user.linkedinUrl, instagramUrl: user.instagramUrl,
      state: user.state ?? "", city: user.city ?? "",
      universityName: university?.name ?? "Universidade nao encontrada", joinedAt: user.createdAt,
      likes: user.likedByIds?.length ?? user.likes ?? 0,
      likedByMe: viewerId ? includesUser(user.likedByIds ?? [], viewerId) : false,
    },
    stats: {
      eventsCreated: events.filter((event) => event.createdBy.equals(user._id)).length,
      forumsCreated: forums.filter((forum) => forum.createdBy.equals(user._id)).length,
      groupsCreated: groups.filter((group) => group.createdBy.equals(user._id)).length,
      badgesEarned: badges.length,
    },
    badges,
  };
};

export const listCampusEvents = async (campusSlug: string, viewerId?: ObjectId | null) => {
  const campus = await findCampusBySlug(campusSlug);
  if (!campus) throw new Error("Campus not found");

  let isMember = false;
  if (viewerId) {
    const membership = await getCampusMembership(viewerId, campus._id);
    if (membership && membership.status === "ACTIVE") {
      isMember = true;
    } else {
      const user = await AppDataSource.getMongoRepository(User).findOneBy({ _id: viewerId });
      if (user && user.emailVerifiedAt && user.universityId?.equals(campus._id)) {
        isMember = true;
      }
    }
  }

  const query: Record<string, unknown> = isMember
    ? {
        $or: [
          { visibility: "GLOBAL" },
          { visibility: { $exists: false } },
          { visibility: "CAMPUS", campusId: campus._id },
        ],
      }
    : {
        $or: [
          { visibility: "GLOBAL" },
          { visibility: { $exists: false } },
        ],
      };

  const events = await eventRepository().find({
    where: query as never,
    order: { startsAt: "ASC" },
  });

  const organizerIds = [...new Map(events.map((event) => [event.createdBy.toHexString(), event.createdBy])).values()];
  const organizers = organizerIds.length
    ? await AppDataSource.getMongoRepository(User).findByIds(organizerIds)
    : [];
  const universityIds = organizers.map((organizer) => organizer.universityId).filter(Boolean);
  const universities = universityIds.length
    ? await AppDataSource.getMongoRepository(University).findByIds(universityIds)
    : [];
  const universityNames = new Map(universities.map((university) => [university._id.toHexString(), university.name]));

  const organizerViews = new Map(organizers.filter(isVerifiedUser).map((organizer) => [
    organizer._id.toHexString(),
    publicEventParticipant(
      organizer,
      organizer.universityId ? universityNames.get(organizer.universityId.toHexString()) ?? campus.name : campus.name,
    ),
  ]));



  return {
    campus: {
      id: campus._id.toHexString(),
      name: campus.name,
      slug: campus.slug,
      emailDomains: campus.emailDomains ?? [],
    },
    isMember,
    events: events.map((event) => ({
      ...eventView(event, viewerId),
      organizer: organizerViews.get(event.createdBy.toHexString()),
    })),
  };
};

export const listCampusWorkshops = async (campusSlug: string, viewerId?: ObjectId | null) => {
  const { campus, isMember, events } = await listCampusEvents(campusSlug, viewerId);
  const workshopTags = new Set(["workshop", "study-jam", "ai", "cloud", "web", "android", "hackathon"]);
  const workshops = events.filter((e) => e.tags.some((tag) => workshopTags.has(tag)) || e.title.toLowerCase().includes("workshop") || e.title.toLowerCase().includes("hands-on"));
  return { campus, isMember, workshops };
};

export const getCampusResources = async (campusSlug: string, viewerId?: ObjectId | null) => {
  const campus = await findCampusBySlug(campusSlug);
  if (!campus) throw new Error("Campus not found");

  const isMember = Boolean(viewerId && (await getCampusMembership(viewerId, campus._id))?.status === "ACTIVE");

  return {
    campus: {
      id: campus._id.toHexString(),
      name: campus.name,
      slug: campus.slug,
      description: campus.description ?? "",
    },
    isMember,
    resources: [
      {
        id: "res-prompt-vault",
        title: `Cofre de Prompts Acadêmicos · ${campus.name}`,
        category: "Engenharia de Prompt",
        description: "Prompts calibrados para revisões bibliográficas, resumos com tabelas conceituais e simulações de bancas acadêmicas.",
        level: "Iniciante a Avançado",
        isCampusExclusive: false,
        url: "/students#prompts",
      },
      {
        id: "res-anti-hallucination",
        title: "Guia de Grounding e Anti-Alucinação",
        category: "Rigor Científico",
        description: "Metodologia passo a passo de Chain-of-Verification para validação cruzada de fontes em artigos e TCCs.",
        level: "Intermediário",
        isCampusExclusive: false,
        url: "/students#anti-hallucination",
      },
      {
        id: "res-study-group-kit",
        title: `Kit de Liderança de Study Jams (${campus.slug.toUpperCase()})`,
        category: "Comunidade",
        description: "Roteiro completo para embaixadores e alunos organizarem grupos de estudos de IA no campus.",
        level: "Liderança",
        isCampusExclusive: true,
        url: `/${campus.slug}/gemini`,
      },
    ],
  };
};

export const getCampusGeminiHub = async (campusSlug: string, viewerId?: ObjectId | null) => {
  const campus = await findCampusBySlug(campusSlug);
  if (!campus) throw new Error("Campus not found");

  const isMember = Boolean(viewerId && (await getCampusMembership(viewerId, campus._id))?.status === "ACTIVE");

  return {
    campus: {
      id: campus._id.toHexString(),
      name: campus.name,
      slug: campus.slug,
    },
    isMember,
    modules: [
      {
        id: "gemini-transformers",
        title: "Mecanismo de Atenção e Transformers no Campus",
        description: "Entenda a matemática e os pesos por trás dos modelos generativos com exemplos práticos desenvolvidos na universidade.",
        icon: "cpu",
      },
      {
        id: "gemini-study-jams",
        title: `Study Jams de IA em ${campus.city ?? campus.name}`,
        description: "Encontros práticos com notebooks, APIs e experimentação de prompts guiados por embaixadores.",
        icon: "sparkles",
      },
    ],
  };
};

export type ListGlobalEventsFilter = {

  timeframe?: "upcoming" | "past" | "month" | "all";
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export const listGlobalEvents = async (
  filter: ListGlobalEventsFilter = {},
  viewerId?: ObjectId | null,
) => {
  const events = await eventRepository().find({
    where: { visibility: "GLOBAL" },
    order: { startsAt: filter.timeframe === "past" ? "DESC" : "ASC" },
  });

  const now = Date.now();
  let mapped = events.map((event) => eventView(event, viewerId));

  if (filter.timeframe === "upcoming") {
    mapped = mapped.filter((e) => new Date(e.startsAt).getTime() >= now);
  } else if (filter.timeframe === "past") {
    mapped = mapped.filter((e) => new Date(e.startsAt).getTime() < now);
  } else if (filter.timeframe === "month") {
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    mapped = mapped.filter((e) => {
      const time = new Date(e.startsAt).getTime();
      return time >= now && time <= thirtyDaysFromNow;
    });
  }

  if (filter.tag) {
    mapped = mapped.filter((e) => e.tags.some((t) => t.toLowerCase() === filter.tag?.toLowerCase()));
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    mapped = mapped.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const page = Math.max(filter.page ?? 1, 1);
  const limit = Math.min(Math.max(filter.limit ?? 20, 1), 50);
  const skip = (page - 1) * limit;

  return {
    total: mapped.length,
    page,
    limit,
    events: mapped.slice(skip, skip + limit),
  };
};


