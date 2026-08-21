import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Campus } from "../../database/models/campus.model";
import { CampusMember } from "../../database/models/campus-member.model";
import { User } from "../../database/models/user.model";
import { findCampusBySlug, getCampusMembership, ensureUserCampusMembership, validateInstitutionalEmail } from "../../services/campus.services";
import { getAuthenticatedUserId } from "./auth.middleware";
import { AppDataSource } from "../../database/AppDataSource";

export type CampusRequest = Request & {
  campus?: Campus;
  campusMember?: CampusMember;
  userId?: ObjectId;
  currentUser?: User;
};

export const resolveCampus = async (request: CampusRequest, response: Response, next: NextFunction) => {
  const rawSlug = String(request.params.campusSlug || "");
  if (!rawSlug) {
    return response.status(400).json({ error: "Identificador de campus não informado" });
  }

  try {
    const campus = await findCampusBySlug(rawSlug);
    if (!campus) {
      return response.status(404).json({ error: "Campus não encontrado" });
    }
    request.campus = campus;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireCampusAccess = (options: { requireAmbassador?: boolean } = {}) => {
  return async (request: CampusRequest, response: Response, next: NextFunction) => {
    const campus = request.campus;
    if (!campus) {
      return response.status(404).json({ error: "Campus não encontrado" });
    }

    const userId = request.userId ?? (await getAuthenticatedUserId(request));
    if (!userId) {
      return response.status(401).json({ error: "Faça login para acessar este espaço universitário" });
    }

    try {
      const user = request.currentUser ?? (await AppDataSource.getMongoRepository(User).findOneBy({ _id: userId }));
      if (!user) {
        return response.status(401).json({ error: "Sessão inválida" });
      }

      if (!user.emailVerifiedAt) {
        return response.status(403).json({ error: "Confirme seu e-mail institucional para acessar o campus" });
      }

      request.userId = user._id;
      request.currentUser = user;

      let membership = await getCampusMembership(user._id, campus._id);

      // If user doesn't have an explicit membership record yet, check if their verified email matches the campus domain
      if (!membership || membership.status !== "ACTIVE") {
        const hasMatchingDomain = validateInstitutionalEmail(user.email, campus);
        const isAssociatedAmbassador = user.userType === "ambassador" && user.universityId?.equals(campus._id);

        if (hasMatchingDomain || isAssociatedAmbassador) {
          membership = await ensureUserCampusMembership(
            user,
            campus,
            user.userType === "ambassador" ? "AMBASSADOR" : "STUDENT",
          );
        }
      }

      if (!membership || membership.status !== "ACTIVE") {
        return response.status(403).json({
          error: `Este conteúdo é exclusivo para estudantes da ${campus.name}. Utilize seu e-mail institucional para acessar.`,
          requiredDomains: campus.emailDomains,
        });
      }

      if (options.requireAmbassador && membership.role !== "AMBASSADOR" && membership.role !== "CAMPUS_ADMIN") {
        return response.status(403).json({ error: "Apenas embaixadores deste campus têm permissão para esta ação" });
      }

      request.campusMember = membership;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
