import { Router, type NextFunction, type Request, type Response } from "express";
import { eventNewsSchema, eventOrganizerSchema, eventSchema, eventUpdateSchema } from "../../database/schemas/community.schema";
import { addEventNews, addEventOrganizer, addEventOrganizerGroup, createEvent, createEventForum, deleteEvent, getEventDetails, listEventDirectory, listEvents, removeEventOrganizer, setEventParticipation, updateEvent } from "../../services/community.services";
import { getAuthenticatedUserId, requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.middleware";

const eventsController = Router();

eventsController.get("/", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ events: await listEvents(request.userId!) }); } catch (error) { return next(error); }
});

eventsController.post("/", requireAuth, requireRole("ambassador"), async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.status(201).json({ event: await createEvent(eventSchema.parse(request.body), request.userId!) }); } catch (error) { return next(error); }
});

eventsController.get("/discover", async (request: Request, response: Response, next: NextFunction) => {
  try { return response.json({ events: await listEventDirectory(await getAuthenticatedUserId(request)) }); } catch (error) { return next(error); }
});

eventsController.get("/:eventId", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const event = await getEventDetails(String(request.params.eventId), await getAuthenticatedUserId(request));
    if (!event) return response.status(404).json({ error: "Evento não encontrado" });
    return response.json(event);
  } catch (error) { return next(error); }
});

eventsController.post("/:eventId/participation", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await setEventParticipation(String(request.params.eventId), request.userId!, true) }); } catch (error) { return next(error); }
});

eventsController.delete("/:eventId/participation", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await setEventParticipation(String(request.params.eventId), request.userId!, false) }); } catch (error) { return next(error); }
});

eventsController.delete("/:eventId", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { await deleteEvent(String(request.params.eventId), request.userId!); return response.status(204).send(); } catch (error) { return next(error); }
});

eventsController.patch("/:eventId", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await updateEvent(String(request.params.eventId), eventUpdateSchema.parse(request.body), request.userId!) }); } catch (error) { return next(error); }
});

eventsController.post("/:eventId/organizers", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await addEventOrganizer(String(request.params.eventId), eventOrganizerSchema.parse(request.body).userId, request.userId!) }); } catch (error) { return next(error); }
});

eventsController.post("/:eventId/organizer-groups", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await addEventOrganizerGroup(String(request.params.eventId), eventOrganizerSchema.parse(request.body).userId, request.userId!) }); } catch (error) { return next(error); }
});

eventsController.delete("/:eventId/organizers/:userId", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.json({ event: await removeEventOrganizer(String(request.params.eventId), String(request.params.userId), request.userId!) }); } catch (error) { return next(error); }
});

eventsController.post("/:eventId/news", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.status(201).json({ event: await addEventNews(String(request.params.eventId), eventNewsSchema.parse(request.body).content, request.userId!) }); } catch (error) { return next(error); }
});

eventsController.post("/:eventId/forum", requireAuth, async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try { return response.status(201).json({ event: await createEventForum(String(request.params.eventId), request.userId!) }); } catch (error) { return next(error); }
});

export default eventsController;
