import { Router, type NextFunction, type Response } from "express";
import { groupInvitationResponseSchema, groupInvitationSchema, groupSchema } from "../../database/schemas/community.schema";
import { createGroup, deleteGroup, inviteGroupMember, listGroupInvitations, listGroups, listPendingGroupMembers, respondToGroupInvitation, setGroupParticipation, updateGroup } from "../../services/community.services";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.middleware";

const groupController = Router();

groupController.use(requireAuth, requireRole("ambassador"));

groupController.get("/", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ groups: await listGroups(request.userId!) }); } catch (error) { return next(error); }
});

groupController.get("/invitations", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ groups: await listGroupInvitations(request.userId!) }); } catch (error) { return next(error); }
});

groupController.get("/:groupId/pending-members", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ members: await listPendingGroupMembers(String(request.params.groupId), request.userId!) }); } catch (error) { return next(error); }
});

groupController.post("/", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.status(201).json({ group: await createGroup(groupSchema.parse(request.body), request.currentUser!) }); } catch (error) { return next(error); }
});

groupController.patch("/:groupId", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ group: await updateGroup(String(request.params.groupId), groupSchema.parse(request.body), request.userId!) }); } catch (error) { return next(error); }
});

groupController.delete("/:groupId", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { await deleteGroup(String(request.params.groupId), request.userId!); return response.status(204).send(); } catch (error) { return next(error); }
});

groupController.post("/:groupId/invitations", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.status(201).json({ group: await inviteGroupMember(String(request.params.groupId), groupInvitationSchema.parse(request.body).userId, request.userId!) }); } catch (error) { return next(error); }
});

groupController.post("/:groupId/invitations/respond", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ group: await respondToGroupInvitation(String(request.params.groupId), request.userId!, groupInvitationResponseSchema.parse(request.body).accept) }); } catch (error) { return next(error); }
});

groupController.post("/:groupId/participation", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ group: await setGroupParticipation(String(request.params.groupId), request.userId!, true) }); } catch (error) { return next(error); }
});

groupController.delete("/:groupId/participation", async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ group: await setGroupParticipation(String(request.params.groupId), request.userId!, false) }); } catch (error) { return next(error); }
});

export default groupController;
