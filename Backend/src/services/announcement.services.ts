import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { Announcement, type AnnouncementCategory } from "../database/models/announcement.model";
import { getCampusMembership } from "./campus.services";

const announcementRepository = () => AppDataSource.getMongoRepository(Announcement);

export const ensureAnnouncementIndexes = async () => {
  try {
    const raw = announcementRepository();
    await raw.createCollectionIndex({ visibility: 1, publishedAt: -1 });
    await raw.createCollectionIndex({ campusId: 1, publishedAt: -1 });
  } catch {
    // Indexes already exist
  }
};

export type CreateAnnouncementInput = {
  title: string;
  content: string;
  summary?: string;
  visibility: "GLOBAL" | "CAMPUS";
  campusId?: string;
  category?: AnnouncementCategory;
  isPinned?: boolean;
};

export const createAnnouncement = async (
  input: CreateAnnouncementInput,
  authorId: ObjectId,
  authorName: string,
): Promise<Announcement> => {
  const repo = announcementRepository();
  const campusObjectId = input.visibility === "CAMPUS" && input.campusId && ObjectId.isValid(input.campusId)
    ? new ObjectId(input.campusId)
    : undefined;

  if (input.visibility === "CAMPUS" && !campusObjectId) {
    throw new Error("campusId é obrigatório para comunicados de campus");
  }

  const announcement = repo.create({
    title: input.title.trim(),
    content: input.content.trim(),
    summary: input.summary?.trim() || input.content.trim().slice(0, 200),
    visibility: input.visibility,
    campusId: campusObjectId,
    category: input.category ?? "GENERAL",
    authorId,
    authorName,
    isPinned: input.isPinned ?? false,
    isPublished: true,
    publishedAt: new Date(),
  });

  return await repo.save(announcement);
};

export const listAnnouncements = async (
  options: {
    scope?: "GLOBAL" | "CAMPUS" | "ALL";
    campusId?: string;
    category?: AnnouncementCategory;
    limit?: number;
    page?: number;
  },
  viewerId?: ObjectId | null,
) => {
  const repo = announcementRepository();
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
  const page = Math.max(options.page ?? 1, 1);
  const skip = (page - 1) * limit;

  const allAnnouncements = await repo.find({
    where: { isPublished: true },
    order: { isPinned: "DESC", publishedAt: "DESC" },
  });

  let filtered = allAnnouncements;

  if (options.scope === "GLOBAL") {
    filtered = filtered.filter((a) => a.visibility === "GLOBAL");
  } else if (options.scope === "CAMPUS" && options.campusId && ObjectId.isValid(options.campusId)) {
    const campusObjId = new ObjectId(options.campusId);
    filtered = filtered.filter(
      (a) => a.visibility === "CAMPUS" && a.campusId && a.campusId.equals(campusObjId),
    );
  } else if (options.campusId && ObjectId.isValid(options.campusId)) {
    const campusObjId = new ObjectId(options.campusId);
    // If viewing from a campus hub, check if viewer is a member to allow private campus announcements
    let canViewPrivate = false;
    if (viewerId) {
      const membership = await getCampusMembership(viewerId, campusObjId);
      canViewPrivate = membership?.status === "ACTIVE";
    }
    filtered = filtered.filter((a) => {
      if (a.visibility === "GLOBAL") return true;
      if (a.visibility === "CAMPUS" && a.campusId && a.campusId.equals(campusObjId)) {
        return canViewPrivate;
      }
      return false;
    });
  }

  if (options.category) {
    filtered = filtered.filter((a) => a.category === options.category);
  }

  const total = filtered.length;
  const items = filtered.slice(skip, skip + limit);

  return {
    total,
    page,
    limit,
    announcements: items.map((a) => ({
      id: a._id.toHexString(),
      title: a.title,
      content: a.content,
      summary: a.summary ?? a.content.slice(0, 180),
      visibility: a.visibility,
      campusId: a.campusId?.toHexString() ?? null,
      category: a.category,
      authorName: a.authorName,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt.toISOString(),
    })),
  };
};

export const seedDefaultAnnouncements = async () => {
  const repo = announcementRepository();
  const count = await repo.count();
  if (count > 0) return;

  const defaultAuthorId = new ObjectId();
  await repo.save([
    repo.create({
      title: "Boas-vindas ao Ecossistema Student Ambassador",
      content: "Seja bem-vindo à rede acadêmica de estudantes e embaixadores. Acesse o portal de eventos globais, encontre embaixadores em sua região e explore os espaços dedicados de cada universidade.",
      summary: "Início oficial do hub de conexões universitárias e inteligência artificial.",
      visibility: "GLOBAL",
      category: "GENERAL",
      authorId: defaultAuthorId,
      authorName: "Equipe Student Ambassador",
      isPinned: true,
      isPublished: true,
      publishedAt: new Date(),
    }),
    repo.create({
      title: "Abertas as inscrições para as Study Jams de IA Generativa 2026",
      content: "Estudantes de todas as universidades já podem se inscrever nas Study Jams práticas com Google Gemini, LLMs e Engenharia de Prompts.",
      summary: "Workshops práticos de IA com certificação e projetos aplicados.",
      visibility: "GLOBAL",
      category: "ACADEMIC",
      authorId: defaultAuthorId,
      authorName: "Coordenação de Workshops",
      isPinned: false,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000),
    }),
  ]);
};
