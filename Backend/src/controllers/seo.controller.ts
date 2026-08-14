import { Router, type NextFunction, type Request, type Response } from "express";
import { getEventDetails, getPublicProfile, listEventDirectory, listForumDirectory } from "../services/community.services";
import { listAmbassadors } from "../services/user.services";

const seoController = Router();

seoController.get("/index", async (_request: Request, response: Response, next: NextFunction) => {
  try {
    const [events, forums, ambassadors] = await Promise.all([listEventDirectory(), listForumDirectory(), listAmbassadors()]);
    return response.json({
      events: events.map((event) => ({ id: event.id, createdAt: event.createdAt, startsAt: event.startsAt })),
      forums: forums.map((forum) => ({ id: forum.id, createdAt: forum.createdAt })),
      profiles: ambassadors.map((ambassador) => ({ id: ambassador.id })),
    });
  } catch (error) { return next(error); }
});

seoController.get("/card/:resource/:id", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const resource = String(request.params.resource);
    const id = String(request.params.id);

    if (resource === "event") {
      const details = await getEventDetails(id);
      if (!details) return response.status(404).json({ error: "Evento não encontrado" });
      const { event } = details;
      return response.json({
        resource,
        title: event.title,
        description: event.description,
        image: event.imageUrls[0] ?? null,
        startsAt: event.startsAt,
        endsAt: event.endsAt ?? null,
        location: [event.location, event.city, event.state].filter(Boolean).join(", "),
        tags: event.tags,
      });
    }

    if (resource === "profile") {
      const data = await getPublicProfile(id);
      if (!data) return response.status(404).json({ error: "Perfil não encontrado" });
      const { profile, stats } = data;
      return response.json({
        resource,
        title: profile.nickname ?? profile.name,
        description: profile.bio || `${profile.userType === "ambassador" ? "Embaixador" : "Membro"} da comunidade ${profile.universityName}.`,
        image: profile.avatarPath ?? null,
        universityName: profile.universityName,
        city: profile.city,
        state: profile.state,
        badgesEarned: stats.badgesEarned,
      });
    }

    if (resource === "forum") {
      // The public directory intentionally excludes private forums.
      const forum = (await listForumDirectory()).find((item) => item.id === id);
      if (!forum) return response.status(404).json({ error: "Fórum não encontrado" });
      return response.json({
        resource,
        title: forum.title,
        description: forum.description,
        image: forum.organizer?.avatarPath ?? null,
        organizerName: forum.organizer ? (forum.organizer.nickname ?? forum.organizer.name) : null,
        memberCount: forum.memberCount,
      });
    }

    return response.status(404).json({ error: "Recurso não encontrado" });
  } catch (error) { return next(error); }
});

export default seoController;
