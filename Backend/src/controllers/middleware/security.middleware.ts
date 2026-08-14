import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

const production = process.env.NODE_ENV === "production";
const canonicalOrigin = "https://google.studentembassador.com";
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN ?? (production ? canonicalOrigin : "http://localhost:3000"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

export const isAllowedOrigin = (origin: string) => allowedOrigins.has(origin)
  || (!production && /^http:\/\/(?:[a-z0-9-]+\.)?localhost:3000$/i.test(origin));

export const allowCors = (request: Request, response: Response, next: NextFunction) => {
  const origin = request.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    response.setHeader("Vary", "Origin");
  }
  if (request.method === "OPTIONS") return origin && isAllowedOrigin(origin) ? response.sendStatus(204) : response.sendStatus(403);
  return next();
};

// Cookie sessions are same-site. Requiring a trusted Origin on writes blocks CSRF
// attempts even when a browser has an existing session cookie.
export const requireTrustedOrigin = (request: Request, response: Response, next: NextFunction) => {
  if (!(["POST", "PUT", "PATCH", "DELETE"] as string[]).includes(request.method)) return next();
  const origin = request.headers.origin;
  if (!origin || !isAllowedOrigin(origin)) return response.status(403).json({ error: "Origem da requisição não autorizada" });
  return next();
};

const limiterMessage = { error: "Muitas solicitações. Aguarde alguns minutos e tente novamente." };
export const apiRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: "draft-8", legacyHeaders: false, message: limiterMessage });
export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false, message: limiterMessage, skipSuccessfulRequests: false });
