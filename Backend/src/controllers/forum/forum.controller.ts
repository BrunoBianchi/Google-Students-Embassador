import { Router, type NextFunction, type Request, type Response } from "express";
import {
  forumMemberModerationSchema,
  forumMessageSchema,
  forumSchema,
} from "../../database/schemas/community.schema";
import {
  createForum,
  getForumSummary,
  listForumDirectory,
  listForums,
  setForumParticipation,
  updateForum,
} from "../../services/community.services";
import {
  createForumMessage,
  deleteForum,
  getForum,
  listForumMembers,
  listForumMessages,
  removeForumMember,
  toggleForumMessageLike,
  updateForumMember,
} from "../../services/forum-message.services";
import {
  applyImmediateForumModeration,
  scheduleForumAutoModeration,
} from "../../services/automod/forum-automod.services";
import { DELETED_BY_AUTOMOD } from "../../services/forum-moderation.constants";
import { notifyForumMembers } from "../../services/notification.services";
import {
  requireAuth,
  requireRole,
  getAuthenticatedUserId,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const forumController = Router();

forumController.get(
  "/",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      return response.json({ forums: await listForums(request.userId!) });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.post(
  "/",
  requireAuth,
  requireRole("ambassador"),
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      return response
        .status(201)
        .json({
          forum: await createForum(
            forumSchema.parse(request.body),
            request.userId!,
          ),
        });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.patch(
  "/:forumId",
  requireAuth,
  async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      return response.json({ forum: await updateForum(String(request.params.forumId), forumSchema.parse(request.body), request.userId!) });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.get(
  "/discover",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      return response.json({
        forums: await listForumDirectory(await getAuthenticatedUserId(request)),
      });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.post(
  "/:forumId/participation",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      const forum = await setForumParticipation(forumId, request.userId!, true);
      return response.json({ forum });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.delete(
  "/:forumId/participation",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      const forum = await setForumParticipation(
        forumId,
        request.userId!,
        false,
      );
      return response.json({ forum });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.delete(
  "/:forumId",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      await deleteForum(forumId, request.userId!);
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
);

forumController.get(
  "/:forumId",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forum = await getForumSummary(String(request.params.forumId), request.userId!);
      if (!forum) return response.status(404).json({ error: "Forum not found" });
      return response.json({ forum });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.get(
  "/:forumId/messages",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      return response.json({
        messages: await listForumMessages(
          String(request.params.forumId),
          request.userId!,
        ),
      });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.post(
  "/:forumId/messages",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      const payload = forumMessageSchema.parse(request.body);
      const message = await createForumMessage(
        forumId,
        request.userId!,
        payload.content,
        payload.parentMessageId,
      );
      const moderation = await applyImmediateForumModeration({
        forumId,
        messageId: message.id,
        authorId: request.userId!.toHexString(),
        content: message.content,
      });
      const messageForClient = moderation.deleted
        ? {
            ...message,
            content: DELETED_BY_AUTOMOD,
            isDeleted: true,
            mentionedUserIds: [],
          }
        : message;
      if (moderation.action === "allow") {
        const forum = await getForum(forumId);
        if (forum) void notifyForumMembers({ id: forum._id.toHexString(), title: forum.title, memberIds: forum.memberIds }, request.userId!, message.content);
        scheduleForumAutoModeration({
          forumId,
          messageId: message.id,
          authorId: request.userId!.toHexString(),
          content: message.content,
        });
      }
      return response.status(201).json({ message: messageForClient });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.post(
  "/:forumId/messages/:messageId/like",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      const message = await toggleForumMessageLike(
        forumId,
        String(request.params.messageId),
        request.userId!,
      );
      return response.json({ message });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.get(
  "/:forumId/members",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      return response.json({
        members: await listForumMembers(
          String(request.params.forumId),
          request.userId!,
        ),
      });
    } catch (error) {
      return next(error);
    }
  },
);

forumController.patch(
  "/:forumId/members/:userId",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      const update = forumMemberModerationSchema.parse(request.body);
      await updateForumMember(
        forumId,
        request.userId!,
        String(request.params.userId),
        update,
      );
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
);

forumController.delete(
  "/:forumId/members/:userId",
  requireAuth,
  async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const forumId = String(request.params.forumId);
      await removeForumMember(
        forumId,
        request.userId!,
        String(request.params.userId),
      );
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
);

export default forumController;
