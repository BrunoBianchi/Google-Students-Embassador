import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { AppDataSource } from "../../database/AppDataSource";
import { User, type UserType } from "../../database/models/user.model";
import { getServerSessionUserId } from "../../services/session.services";

export type AuthenticatedRequest = Request & { userId?: ObjectId; currentUser?: User };
type CookieRequest = { headers: { cookie?: string } };

const SESSION_COOKIE_NAME = process.env.NODE_ENV === "production" ? "__Host-gsa_session" : "gsa_session";
const sessionError = "Sessao invalida ou expirada";

export const readCookie = (request: CookieRequest, name: string): string | undefined => request.headers.cookie
  ?.split(";")
  .map((cookie) => cookie.trim().split("="))
  .find(([cookieName]) => cookieName === name)
  ?.slice(1)
  .join("=");

export const requireAuth = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  const userId = token ? await getServerSessionUserId(token) : null;
  if (!userId) return response.status(401).json({ error: sessionError });
  try {
    const user = await AppDataSource.getMongoRepository(User).findOneBy({ _id: userId });
    if (!user) return response.status(401).json({ error: sessionError });
    if (!user.emailVerifiedAt) return response.status(403).json({ error: "Confirme seu e-mail para acessar o Hub" });
    request.userId = user._id;
    request.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const getAuthenticatedUserId = async (request: CookieRequest): Promise<ObjectId | null> => {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  return token ? await getServerSessionUserId(token) : null;
};

// Authorization is enforced by the API, so a student cannot bypass the UI by calling a protected route directly.
export const requireRole = (...roles: UserType[]) => async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  if (!request.userId) return response.status(401).json({ error: sessionError });
  try {
    const user = request.currentUser ?? await AppDataSource.getMongoRepository(User).findOneBy({ _id: request.userId });
    if (!user) return response.status(401).json({ error: sessionError });
    if (!roles.includes(user.userType)) return response.status(403).json({ error: "Voce nao tem permissao para esta acao" });
    request.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export { SESSION_COOKIE_NAME };
