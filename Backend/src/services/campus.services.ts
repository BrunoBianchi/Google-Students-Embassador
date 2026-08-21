import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { Campus } from "../database/models/campus.model";
import { CampusMember, type CampusMemberRole } from "../database/models/campus-member.model";
import { User } from "../database/models/user.model";
import { CommunityEvent } from "../database/models/event.model";
import { normalizeCampusSlug, normalizeEmailDomain } from "../database/schemas/campus.schema";

import { getRegionByState, getStatesForRegionSlug } from "./region.services";

const campusRepository = () => AppDataSource.getMongoRepository(Campus);
const memberRepository = () => AppDataSource.getMongoRepository(CampusMember);
const userRepository = () => AppDataSource.getMongoRepository(User);
const eventRepository = () => AppDataSource.getMongoRepository(CommunityEvent);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const ensureCampusIndexes = async () => {
  const campRepo = campusRepository();
  const memRepo = memberRepository();

  await campRepo.createCollectionIndex({ slug: 1 }, { unique: true, name: "campus_slug_unique" }).catch(() => undefined);
  await campRepo.createCollectionIndex({ name: 1 }, { name: "campus_name_idx" }).catch(() => undefined);
  await campRepo.createCollectionIndex({ state: 1, region: 1 }, { name: "campus_region_idx" }).catch(() => undefined);
  await memRepo.createCollectionIndex({ userId: 1, campusId: 1 }, { unique: true, name: "campus_member_user_campus_unique" }).catch(() => undefined);
  await memRepo.createCollectionIndex({ campusId: 1, role: 1, status: 1 }, { name: "campus_member_lookup_idx" }).catch(() => undefined);
};

export const seedDefaultCampuses = async () => {
  const defaults: Array<{ name: string; slug: string; emailDomains: string[]; city: string; state: string; description: string }> = [
    {
      name: "Universidade Federal de Itajubá",
      slug: "unifei",
      emailDomains: ["unifei.edu.br"],
      city: "Itajubá",
      state: "MG",
      description: "Comunidade acadêmica e de inovação tecnológica da UNIFEI. Foco em engenharia, IA e ciência da computação.",
    },
    {
      name: "Universidade de São Paulo",
      slug: "usp",
      emailDomains: ["usp.br"],
      city: "São Paulo",
      state: "SP",
      description: "Hub universitário de tecnologia e inteligência artificial dos estudantes e pesquisadores da USP.",
    },
    {
      name: "Universidade Federal de São Paulo",
      slug: "unifesp",
      emailDomains: ["unifesp.br"],
      city: "São Paulo",
      state: "SP",
      description: "Comunidade de inovação multidisciplinar da UNIFESP, integrando tecnologia, saúde e ciências exatas.",
    },
    {
      name: "Universidade Estadual de Campinas",
      slug: "unicamp",
      emailDomains: ["unicamp.br"],
      city: "Campinas",
      state: "SP",
      description: "Hub acadêmico e tecnológico dos estudantes da UNICAMP para desenvolvimento em IA e computação.",
    },
    {
      name: "Universidade Federal de Minas Gerais",
      slug: "ufmg",
      emailDomains: ["ufmg.br"],
      city: "Belo Horizonte",
      state: "MG",
      description: "Comunidade universitária da UFMG voltada para inovação, liderança e engenharia de software.",
    },
    {
      name: "Universidade Federal do Rio de Janeiro",
      slug: "ufrj",
      emailDomains: ["ufrj.br"],
      city: "Rio de Janeiro",
      state: "RJ",
      description: "Polo de tecnologia e projetos acadêmicos da comunidade universitária da UFRJ.",
    },
  ];

  for (const item of defaults) {
    const existing = await campusRepository().findOneBy({ slug: item.slug });
    const region = getRegionByState(item.state);
    if (!existing) {
      const entity = campusRepository().create({
        name: item.name,
        slug: item.slug,
        emailDomains: item.emailDomains,
        city: item.city,
        state: item.state,
        region,
        description: item.description,
        country: "BR",
        isActive: true,
      });
      await campusRepository().save(entity).catch(() => undefined);
    } else if (!existing.region) {
      existing.region = region;
      await campusRepository().save(existing).catch(() => undefined);
    }
  }

  // Backfill any unmigrated events so they are marked as GLOBAL
  await eventRepository().updateMany(
    { $or: [{ visibility: { $exists: false } }, { visibility: null }] } as never,
    { $set: { visibility: "GLOBAL" } } as never,
  ).catch(() => undefined);
};

export const findCampusBySlug = async (rawSlug: string): Promise<Campus | null> => {
  const slug = normalizeCampusSlug(rawSlug);
  if (!slug) return null;
  return campusRepository().findOneBy({ slug, isActive: true });
};

export const findCampusById = async (id: string | ObjectId): Promise<Campus | null> => {
  if (!id) return null;
  const objectId = typeof id === "string" ? (ObjectId.isValid(id) ? new ObjectId(id) : null) : id;
  if (!objectId) return null;
  return campusRepository().findOneBy({ _id: objectId });
};

export const createOrFindCampus = async (
  name: string,
  extra: { slug?: string; emailDomains?: string[]; city?: string; state?: string; region?: string } = {},
): Promise<Campus> => {
  const normalizedName = name.trim();
  const slug = extra.slug ? normalizeCampusSlug(extra.slug) : normalizeCampusSlug(normalizedName);

  const existing = await campusRepository().findOne({
    where: {
      $or: [
        { slug },
        { name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") } },
      ],
    } as never,
  });

  const region = extra.region || getRegionByState(extra.state);

  if (existing) {
    let shouldSave = false;
    if (extra.emailDomains?.length) {
      const merged = Array.from(new Set([...(existing.emailDomains ?? []), ...extra.emailDomains.map(normalizeEmailDomain)]));
      existing.emailDomains = merged;
      shouldSave = true;
    }
    if (!existing.region && region) {
      existing.region = region;
      shouldSave = true;
    }
    if (shouldSave) {
      await campusRepository().save(existing);
    }
    return existing;
  }

  const defaultDomain = slug.includes(".") ? slug : `${slug}.edu.br`;
  const emailDomains = (extra.emailDomains?.length ? extra.emailDomains : [defaultDomain]).map(normalizeEmailDomain);

  const campus = campusRepository().create({
    name: normalizedName,
    slug,
    emailDomains,
    city: extra.city,
    state: extra.state,
    region,
    country: "BR",
    isActive: true,
  });

  return await campusRepository().save(campus);
};

export type ListCampusesFilter = {
  query?: string;
  region?: string;
  state?: string;
  city?: string;
  hasEvents?: boolean;
  hasAmbassadors?: boolean;
};

export const listCampuses = async (filterParams: ListCampusesFilter | string = {}) => {
  const params: ListCampusesFilter = typeof filterParams === "string" ? { query: filterParams } : filterParams;
  const query = params.query?.trim();

  const filter: Record<string, unknown> = { isActive: true };
  if (query && query.length >= 2) {
    const regex = { $regex: escapeRegex(query), $options: "i" };
    filter.$or = [{ name: regex }, { slug: regex }, { city: regex }, { state: regex }, { region: regex }];
  }

  if (params.state && params.state !== "ALL") {
    filter.state = params.state.trim().toUpperCase();
  }

  if (params.region && params.region !== "ALL") {
    const regionStates = getStatesForRegionSlug(params.region);
    if (regionStates.length > 0) {
      filter.$or = [
        { region: { $regex: new RegExp(`^${escapeRegex(params.region)}$`, "i") } },
        { state: { $in: regionStates } },
      ];
    } else {
      filter.region = { $regex: new RegExp(`^${escapeRegex(params.region)}$`, "i") };
    }
  }

  if (params.city) {
    filter.city = { $regex: escapeRegex(params.city.trim()), $options: "i" };
  }

  const campuses = await campusRepository().find({
    where: filter as never,
    order: { name: "ASC" },
  });

  const memberRepo = memberRepository();
  const eventRepo = eventRepository();

  const results = await Promise.all(
    campuses.map(async (campus) => {
      const region = campus.region || getRegionByState(campus.state);
      const [totalMembers, ambassadorCount, eventsCount] = await Promise.all([
        memberRepo.countBy({ campusId: campus._id, status: "ACTIVE" }),
        memberRepo.countBy({ campusId: campus._id, role: "AMBASSADOR", status: "ACTIVE" }),
        eventRepo.countBy({ campusId: campus._id }),
      ]);

      return {
        id: campus._id.toHexString(),
        name: campus.name,
        slug: campus.slug,
        description: campus.description ?? "",
        emailDomains: campus.emailDomains ?? [],
        city: campus.city ?? "",
        state: campus.state ?? "",
        region,
        country: campus.country ?? "BR",
        logoUrl: campus.logoUrl,
        coverImageUrl: campus.coverImageUrl,
        totalMembers,
        ambassadorCount,
        eventsCount,
      };
    }),
  );

  let filtered = results;
  if (params.hasEvents) {
    filtered = filtered.filter((c) => c.eventsCount > 0);
  }
  if (params.hasAmbassadors) {
    filtered = filtered.filter((c) => c.ambassadorCount > 0);
  }

  return filtered;
};


export const validateInstitutionalEmail = (email: string, campus: Campus): boolean => {
  if (!email || !email.includes("@")) return false;
  const domain = normalizeEmailDomain(email.split("@").pop() ?? "");
  if (!domain) return false;

  const allowed = (campus.emailDomains ?? []).map(normalizeEmailDomain);
  return allowed.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`));
};

export const getCampusMembership = async (
  userId: ObjectId,
  campusId: ObjectId,
): Promise<CampusMember | null> => {
  return memberRepository().findOneBy({ userId, campusId });
};

export const ensureUserCampusMembership = async (
  user: User,
  campus: Campus,
  role: CampusMemberRole = user.userType === "ambassador" ? "AMBASSADOR" : "STUDENT",
): Promise<CampusMember> => {
  const existing = await getCampusMembership(user._id, campus._id);
  if (existing) {
    if (user.userType === "ambassador" && existing.role !== "AMBASSADOR") {
      existing.role = "AMBASSADOR";
      existing.status = "ACTIVE";
      return await memberRepository().save(existing);
    }
    return existing;
  }

  const member = memberRepository().create({
    userId: user._id,
    campusId: campus._id,
    role,
    status: "ACTIVE",
  });

  return await memberRepository().save(member);
};

export const getUserCampuses = async (userId: ObjectId) => {
  const memberships = await memberRepository().find({ where: { userId, status: "ACTIVE" } });
  const campusIds = memberships.map((m) => m.campusId);
  if (!campusIds.length) return [];

  const campuses = await campusRepository().find({
    where: { _id: { $in: campusIds }, isActive: true } as never,
  });

  const membershipMap = new Map(memberships.map((m) => [m.campusId.toHexString(), m]));

  return campuses.map((campus) => {
    const mem = membershipMap.get(campus._id.toHexString());
    return {
      id: campus._id.toHexString(),
      name: campus.name,
      slug: campus.slug,
      description: campus.description ?? "",
      city: campus.city ?? "",
      state: campus.state ?? "",
      role: mem?.role ?? "STUDENT",
      joinedAt: mem?.createdAt,
    };
  });
};

export const getCampusView = async (campus: Campus, viewerId?: ObjectId | null) => {
  let membership: CampusMember | null = null;
  if (viewerId) {
    membership = await getCampusMembership(viewerId, campus._id);
  }

  const [totalMembers, ambassadorMembers] = await Promise.all([
    memberRepository().countBy({ campusId: campus._id, status: "ACTIVE" }),
    memberRepository().find({ where: { campusId: campus._id, role: "AMBASSADOR", status: "ACTIVE" } }),
  ]);

  const ambassadorUserIds = ambassadorMembers.map((m) => m.userId);
  const ambassadors = ambassadorUserIds.length
    ? await userRepository().find({
        where: { _id: { $in: ambassadorUserIds } } as never,
        select: {
          _id: true,
          name: true,
          nickname: true,
          avatarPath: true,
          avatarFrame: true,
          bio: true,
          city: true,
          state: true,
        },
      })
    : [];

  return {
    campus: {
      id: campus._id.toHexString(),
      name: campus.name,
      slug: campus.slug,
      description: campus.description ?? "",
      emailDomains: campus.emailDomains ?? [],
      city: campus.city ?? "",
      state: campus.state ?? "",
      country: campus.country ?? "BR",
      logoUrl: campus.logoUrl,
      coverImageUrl: campus.coverImageUrl,
      stats: {
        totalMembers,
        ambassadorCount: ambassadors.length,
      },
    },
    membership: membership
      ? {
          role: membership.role,
          status: membership.status,
          isMember: membership.status === "ACTIVE",
          isAmbassador: membership.role === "AMBASSADOR" || membership.role === "CAMPUS_ADMIN",
        }
      : null,
    ambassadors: ambassadors.map((a) => ({
      id: a._id.toHexString(),
      name: a.name,
      nickname: a.nickname,
      avatarPath: a.avatarPath,
      avatarFrame: a.avatarFrame ?? "none",
      bio: a.bio ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
    })),
  };
};
