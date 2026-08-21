import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { getAuthenticatedUserId, requireAuth, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { listAmbassadors, getAmbassadorPublicProfile, findUserById } from "../../services/user.services";
import { MACRO_REGIONS, getStatesForRegionSlug } from "../../services/region.services";
import { listAnnouncements, createAnnouncement, type CreateAnnouncementInput } from "../../services/announcement.services";

const connectController = Router();

// This key is intentionally a browser key. Restrict it in Google Cloud by
// HTTP referrer and enable only Maps JavaScript API (and Geocoding when the
// map needs to resolve a city). Server keys must never be returned here.
connectController.get("/map-config", (_req: Request, res: Response) => {
  return res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_BROWSER_API_KEY ?? "",
    googleMapId: process.env.GOOGLE_MAPS_MAP_ID ?? "",
  });
});

const announcementCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(10).max(5000),
  summary: z.string().trim().max(300).optional(),
  visibility: z.enum(["GLOBAL", "CAMPUS"]).default("GLOBAL"),
  campusId: z.string().optional(),
  category: z.enum(["GENERAL", "FEATURE", "EVENT", "OPPORTUNITY", "ACADEMIC"]).default("GENERAL"),
  isPinned: z.boolean().optional(),
});

// GET /connect/ambassadors (with query filters)
connectController.get("/ambassadors", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const { campus, region, state, city, search, course, page, limit } = req.query;

  const result = await listAmbassadors(
    {
      campus: typeof campus === "string" ? campus : undefined,
      region: typeof region === "string" ? region : undefined,
      state: typeof state === "string" ? state : undefined,
      city: typeof city === "string" ? city : undefined,
      search: typeof search === "string" ? search : undefined,
      course: typeof course === "string" ? course : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 30,
    },
    viewerId,
  );

  return res.json(result);
});

// GET /connect/ambassadors/:idOrUsername
connectController.get("/ambassadors/:idOrUsername", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const idOrUsername = String(req.params.idOrUsername);
  try {
    const profile = await getAmbassadorPublicProfile(idOrUsername, viewerId);
    return res.json({ profile });
  } catch (err: any) {
    if (err?.message === "Ambassador not found") {
      return res.status(404).json({ error: "Perfil de Ambassador não encontrado." });
    }
    return res.status(500).json({ error: "Erro ao buscar perfil do Ambassador." });
  }
});

// GET /connect/regions
connectController.get("/regions", async (_req: Request, res: Response) => {
  const regions = await Promise.all(
    MACRO_REGIONS.map(async (reg) => {
      const ambData = await listAmbassadors({ region: reg.slug, limit: 1 });
      return {
        ...reg,
        totalAmbassadors: ambData.total,
      };
    }),
  );

  return res.json({ regions });
});

// GET /connect/regions/:regionSlug
connectController.get("/regions/:regionSlug", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const regionSlug = String(req.params.regionSlug || "").toLowerCase();
  const region = MACRO_REGIONS.find((r) => r.slug === regionSlug);

  if (!region) {
    return res.status(404).json({ error: "Região não encontrada." });
  }

  const { ambassadors, total } = await listAmbassadors({ region: regionSlug, limit: 50 }, viewerId);

  return res.json({
    region: {
      ...region,
      totalAmbassadors: total,
    },
    ambassadors,
  });
});

// GET /connect/announcements
connectController.get("/announcements", async (req: Request, res: Response) => {
  const viewerId = await getAuthenticatedUserId(req);
  const { category, page, limit } = req.query;

  const result = await listAnnouncements(
    {
      scope: "GLOBAL",
      category: typeof category === "string" ? (category as any) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    },
    viewerId,
  );

  return res.json(result);
});

// POST /connect/announcements (Ambassadors and Admins only)
connectController.post("/announcements", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  const user = await findUserById(req.userId);
  if (!user || (user.userType !== "ambassador")) {
    return res.status(403).json({ error: "Apenas embaixadores ou administradores podem publicar comunicados." });
  }

  const parsed = announcementCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
  }

  const announcement = await createAnnouncement(
    parsed.data as CreateAnnouncementInput,
    user._id,
    user.nickname || user.name,
  );

  return res.status(201).json({
    message: "Comunicado publicado com sucesso.",
    announcement: {
      id: announcement._id.toHexString(),
      title: announcement.title,
      content: announcement.content,
      summary: announcement.summary,
      visibility: announcement.visibility,
      category: announcement.category,
      publishedAt: announcement.publishedAt.toISOString(),
    },
  });
});

export default connectController;
