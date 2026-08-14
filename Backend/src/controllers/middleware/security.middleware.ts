import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

const canonicalOrigin = "https://google.studentembassador.com";
const localFrontendOrigin = /^http:\/\/(?:[a-z0-9-]+\.)?localhost:3000$/i;
const localApiHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

const configuredOrigins = () => new Set(
  (process.env.FRONTEND_ORIGIN ?? (process.env.NODE_ENV === "production" ? canonicalOrigin : "http://localhost:3000"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

export const isAllowedOrigin = (origin: string, request?: Request) => configuredOrigins().has(origin)
  || (localFrontendOrigin.test(origin) && Boolean(request && localApiHost.test(request.headers.host ?? "")));

export const allowCors = (request: Request, response: Response, next: NextFunction) => {
  const origin = request.headers.origin;
  if (origin && isAllowedOrigin(origin, request)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    response.setHeader("Vary", "Origin");
  }
  if (request.method === "OPTIONS") return origin && isAllowedOrigin(origin, request) ? response.sendStatus(204) : response.sendStatus(403);
  return next();
};

export const requireTrustedOrigin = (request: Request, response: Response, next: NextFunction) => {
  if (!("POST PUT PATCH DELETE".split(" ")).includes(request.method)) return next();
  const origin = request.headers.origin;
  if (!origin || !isAllowedOrigin(origin, request)) return response.status(403).json({ error: "Origem da requisição não autorizada" });
  return next();
};

const limiterMessage = { error: "Muitas solicitações. Aguarde alguns minutos e tente novamente." };
export const apiRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: "draft-8", legacyHeaders: false, message: limiterMessage });
export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false, message: limiterMessage, skipSuccessfulRequests: false });
