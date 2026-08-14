import { ObjectId } from "mongodb";
import type { Forum } from "../database/models/forum.model";

// A reserved ObjectId lets the moderator appear in forum membership without
// being a login-capable user account.
export const AUTO_MODERATOR_ID = new ObjectId("000000000000000000000001");
export const AUTO_MODERATOR_ID_STRING = AUTO_MODERATOR_ID.toHexString();
export const AUTO_MODERATOR_NAME = "MiMo Guard";
export const AUTO_MODERATOR_NICKNAME = "mimo_guard";
export const DELETED_BY_AUTOMOD = "Essa mensagem foi excluída pelo moderador automático.";
export const isAutoModeratorId = (id: ObjectId) => id.equals(AUTO_MODERATOR_ID);

export const attachAutoModerator = (forum: Forum) => {
  const currentAccess = forum.memberAccess?.[AUTO_MODERATOR_ID_STRING];
  const memberIds = forum.memberIds ?? [];
  const needsMembership = !memberIds.some((id) => isAutoModeratorId(id));
  if (!needsMembership && currentAccess?.role === "moderator") return false;
  forum.memberIds = needsMembership ? [...memberIds, AUTO_MODERATOR_ID] : memberIds;
  forum.memberAccess = { ...(forum.memberAccess ?? {}), [AUTO_MODERATOR_ID_STRING]: { ...currentAccess, role: "moderator" } };
  return true;
};
