import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

const defaultAllowedOrigins = [
  "https://studentembassador.com",
  "https://www.studentembassador.com",
  "https://campus.studentembassador.com",
  "https://events.studentembassador.com",
  "https://connect.studentembassador.com",
  "https://studentambassador.com",
  "https://www.studentambassador.com",
  "https://campus.studentambassador.com",
  "https://events.studentambassador.com",
  "https://connect.studentambassador.com",
];

const localFrontendOrigin = /^http:\/\/(?:[a-z0-9-]+\.)?localhost(?::\d+)?$/i;
const localApiHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

const configuredOrigins = () => new Set([
  ...defaultAllowedOrigins,
  ...(process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean) : []),
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://localhost:5173", "http://campus.localhost:3000", "http://events.localhost:3000", "http://connect.localhost:3000"] : []),
]);

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
