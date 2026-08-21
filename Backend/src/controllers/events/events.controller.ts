import { Router, type Request, type Response } from "express";
import { getAuthenticatedUserId, requireAuth, type AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  listGlobalEvents,
  getEvent,
  createEvent,
  updateEvent,
  cancelEvent,
  participateInEvent,
  cancelParticipation,
} from "../../services/community.services";
import { eventSchema, eventUpdateSchema } from "../../database/schemas/community.schema";

const eventsController = Router();

// GET /events/global (upcoming, past, calendar, all)
eventsController.get("/global", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const { timeframe, tag, search, page, limit } = req.query;

  const result = await listGlobalEvents(
    {
      timeframe: (timeframe === "upcoming" || timeframe === "past" || timeframe === "month" || timeframe === "all")
        ? timeframe
        : "upcoming",
      tag: typeof tag === "string" ? tag : undefined,
      search: typeof search === "string" ? search : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    },
    viewerId,
  );

  return res.json(result);
});

// GET /events/global/:eventId
eventsController.get("/global/:eventId", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const eventId = String(req.params.eventId);
  try {
    const event = await getEvent(eventId, viewerId);
    return res.json({ event });
  } catch (err: any) {
    if (err?.message === "Resource not found") {
      return res.status(404).json({ error: "Evento não encontrado." });
    }
    return res.status(500).json({ error: "Erro ao buscar evento." });
  }
});

// POST /events (Create Event - Global or Campus)
eventsController.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados do evento inválidos", details: parsed.error.issues });
  }

  try {
    const event = await createEvent(parsed.data, req.userId);
    return res.status(201).json({ message: "Evento criado com sucesso.", event });
  } catch (err: any) {
    if (err?.message === "Event management denied") {
      return res.status(403).json({ error: "Você não tem permissão para criar eventos neste campus." });
    }
    return res.status(400).json({ error: err?.message ?? "Não foi possível criar o evento." });
  }
});

// GET /events/:eventId
eventsController.get("/:eventId", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const eventId = String(req.params.eventId);
  try {
    const event = await getEvent(eventId, viewerId);
    return res.json({ event });
  } catch (err: any) {
    if (err?.message === "Resource not found") {
      return res.status(404).json({ error: "Evento não encontrado." });
    }
    return res.status(500).json({ error: "Erro ao buscar evento." });
  }
});

// PATCH /events/:eventId
eventsController.patch("/:eventId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const parsed = eventUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
  }

  const eventId = String(req.params.eventId);
  try {
    const event = await updateEvent(eventId, req.userId, parsed.data);
    return res.json({ message: "Evento atualizado com sucesso.", event });
  } catch (err: any) {
    if (err?.message === "Event management denied") {
      return res.status(403).json({ error: "Você não tem permissão para editar este evento." });
    }
    return res.status(400).json({ error: err?.message ?? "Não foi possível atualizar o evento." });
  }
});

// DELETE /events/:eventId
eventsController.delete("/:eventId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const eventId = String(req.params.eventId);
  try {
    await cancelEvent(eventId, req.userId);
    return res.json({ message: "Evento cancelado com sucesso." });
  } catch (err: any) {
    if (err?.message === "Event management denied") {
      return res.status(403).json({ error: "Você não tem permissão para cancelar este evento." });
    }
    return res.status(400).json({ error: err?.message ?? "Não foi possível cancelar o evento." });
  }
});

// POST /events/:eventId/participate
eventsController.post("/:eventId/participate", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const eventId = String(req.params.eventId);
  try {
    const event = await participateInEvent(eventId, req.userId);
    return res.json({ message: "Inscrição confirmada!", event });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Não foi possível se inscrever no evento." });
  }
});

// DELETE /events/:eventId/participate
eventsController.delete("/:eventId/participate", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const eventId = String(req.params.eventId);
  try {
    const event = await cancelParticipation(eventId, req.userId);
    return res.json({ message: "Inscrição cancelada com sucesso.", event });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Não foi possível cancelar a inscrição." });
  }
});

export default eventsController;
