import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { User } from "../database/models/user.model";
import { sendEventUpdateEmail, sendForumUpdateEmail } from "./mail.services";
import { isAutoModeratorId } from "./forum-moderation.constants";

const users = () => AppDataSource.getMongoRepository(User);
const distinct = (ids: ObjectId[]) => [...new Map(ids.map((id) => [id.toHexString(), id])).values()];

export const notifyEventParticipants = async (event: { id: string; title: string; participantIds?: ObjectId[]; createdBy: ObjectId }, authorId: ObjectId, content: string) => {
  try {
    const recipients = (await users().findByIds(distinct((event.participantIds ?? []).filter((id) => !id.equals(authorId) && !id.equals(event.createdBy))))).filter((user) => Boolean(user.emailVerifiedAt) && user.emailPreferences?.eventUpdates !== false);
    await Promise.allSettled(recipients.map((user) => sendEventUpdateEmail(user, event, content)));
  } catch (error) { console.error("Não foi possível notificar participantes do evento", error); }
};

export const notifyForumMembers = async (forum: { id: string; title: string; memberIds: ObjectId[] }, authorId: ObjectId, content: string) => {
  try {
    const recipientIds = distinct(forum.memberIds.filter((id) => !id.equals(authorId) && !isAutoModeratorId(id)));
    const recipients = (await users().findByIds(recipientIds)).filter((user) => Boolean(user.emailVerifiedAt) && user.emailPreferences?.forumUpdates !== false);
    await Promise.allSettled(recipients.map((user) => sendForumUpdateEmail(user, forum, content)));
  } catch (error) { console.error("Não foi possível notificar participantes do fórum", error); }
};
