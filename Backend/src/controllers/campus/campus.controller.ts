import { Router, type NextFunction, type Request, type Response } from "express";
import { campusCreateSchema, campusJoinSchema } from "../../database/schemas/campus.schema";
import {
  createOrFindCampus,
  getCampusMembership,
  getCampusView,
  listCampuses,
  ensureUserCampusMembership,
  validateInstitutionalEmail,
} from "../../services/campus.services";
import {
  getCampusGeminiHub,
  getCampusResources,
  listCampusEvents,
  listCampusWorkshops,
} from "../../services/community.services";
import { getAuthenticatedUserId, requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.middleware";
import { resolveCampus, type CampusRequest } from "../middleware/campus.middleware";
import { AppDataSource } from "../../database/AppDataSource";
import { User } from "../../database/models/user.model";

const campusController = Router();

// GET /api/.../campuses - List active campuses directory
campusController.get("/", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = typeof request.query.q === "string" ? request.query.q : undefined;
    const campuses = await listCampuses(query);
    return response.json({ campuses });
  } catch (error) {
    return next(error);
  }
});

// POST /api/.../campuses - Create or register a campus (Ambassadors / Admins only)
campusController.post("/", requireAuth, requireRole("ambassador"), async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  try {
    const parsed = campusCreateSchema.parse(request.body);
    const campus = await createOrFindCampus(parsed.name, {
      slug: parsed.slug,
      emailDomains: parsed.emailDomains,
      city: parsed.city,
      state: parsed.state,
    });

    if (request.currentUser) {
      await ensureUserCampusMembership(request.currentUser, campus, "AMBASSADOR");
    }

    return response.status(201).json({ campus });
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug - Get campus overview and viewer membership
campusController.get("/:campusSlug", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const view = await getCampusView(request.campus!, viewerId);
    return response.json(view);
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug/about - Campus leadership, stats, and requirements
campusController.get("/:campusSlug/about", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const view = await getCampusView(request.campus!, viewerId);
    return response.json({
      campus: view.campus,
      membership: view.membership,
      ambassadors: view.ambassadors,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug/events - Global + Campus events (isolated per user membership)
campusController.get("/:campusSlug/events", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const data = await listCampusEvents(request.campus!.slug, viewerId);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug/workshops - Workshops & study jams
campusController.get("/:campusSlug/workshops", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const data = await listCampusWorkshops(request.campus!.slug, viewerId);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug/resources - Academic resources & prompt vaults
campusController.get("/:campusSlug/resources", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const data = await getCampusResources(request.campus!.slug, viewerId);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
});

// GET /api/.../campuses/:campusSlug/gemini - Gemini AI campus hub & study groups
campusController.get("/:campusSlug/gemini", resolveCampus, async (request: CampusRequest, response: Response, next: NextFunction) => {
  try {
    const viewerId = await getAuthenticatedUserId(request);
    const data = await getCampusGeminiHub(request.campus!.slug, viewerId);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
});

// POST /api/.../campuses/:campusSlug/join - Join campus space with verified institutional email
campusController.post("/:campusSlug/join", requireAuth, resolveCampus, async (request: AuthenticatedRequest & CampusRequest, response: Response, next: NextFunction) => {
  try {
    const user = request.currentUser ?? (await AppDataSource.getMongoRepository(User).findOneBy({ _id: request.userId! }));
    if (!user) return response.status(401).json({ error: "Sessão inválida" });

    if (!user.emailVerifiedAt) {
      return response.status(403).json({ error: "Confirme seu e-mail antes de ingressar no campus." });
    }

    const campus = request.campus!;
    const isDomainValid = validateInstitutionalEmail(user.email, campus);
    const isAssociatedAmbassador = user.userType === "ambassador" && user.universityId?.equals(campus._id);

    if (!isDomainValid && !isAssociatedAmbassador) {
      return response.status(403).json({
        error: `O seu e-mail cadastrado (${user.email}) não pertence aos domínios autorizados para o campus ${campus.name}.`,
        requiredDomains: campus.emailDomains,
      });
    }

    const membership = await ensureUserCampusMembership(
      user,
      campus,
      user.userType === "ambassador" ? "AMBASSADOR" : "STUDENT",
    );

    return response.json({
      message: `Bem-vindo ao espaço acadêmico da ${campus.name}!`,
      membership: {
        role: membership.role,
        status: membership.status,
        isMember: true,
        isAmbassador: membership.role === "AMBASSADOR" || membership.role === "CAMPUS_ADMIN",
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default campusController;
